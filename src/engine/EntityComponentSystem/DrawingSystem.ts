import { System } from './System';
import { Type, ComponentTypes } from './Types';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { TransformComponent, CoordPlane } from './TransformComponent';
import { DrawingComponent } from './DrawingComponent';
import { PreDrawEvent, PostDrawEvent, ExitViewPortEvent, EnterViewPortEvent } from '../Events';
import { hasPreDraw, hasPostDraw } from '../Drawing/HasPreDraw';
import { SortedList } from '../Util/SortedList';
import { isActor } from '../Actor';
import { Vector } from '../Algebra';
import { OffscreenComponent } from './OffscreenComponent';

export class DrawingSystem implements System {
  readonly types: Type[] = [ComponentTypes.Transform, ComponentTypes.Drawing];

  private _sortedDrawingTree: SortedList<Entity> = new SortedList<Entity>((e) => {
    const transform = e.components[ComponentTypes.Transform] as TransformComponent;
    return transform.z;
  });

  public ctx: CanvasRenderingContext2D;
  constructor(public engine: Engine) {
    this.ctx = engine.ctx;
  }

  // TODO make this a generic observer notify
  onEntityAdd(entity: Entity) {
    this._sortedDrawingTree.add(entity);
    this._updateZ(entity.components[ComponentTypes.Transform] as TransformComponent);
  }

  onEntityRemove(entity: Entity) {
    this._sortedDrawingTree.removeByComparable(entity);
  }

  private _updateZ(transform: TransformComponent) {
    transform.oldZ = transform.z;
  }

  /**
   * Update is called with enities that have a transform and drawing component
   */
  update(_entities: Entity[], delta: number): void {
    // TODO perhaps observe this change?
    for (const e of _entities) {
      const transform = e.components[ComponentTypes.Transform] as TransformComponent;
      const drawing = e.components[ComponentTypes.Drawing] as DrawingComponent;

      // Handle z index
      if (transform.z !== transform.oldZ) {
        const tempZ = transform.z;
        transform.z = transform.oldZ;
        this._sortedDrawingTree.removeByComparable(e);
        transform.z = tempZ;
        this._sortedDrawingTree.add(e);
        this._updateZ(transform);
      }

      // Handle offscreen culling
      const offscreen = !this.engine.currentScene.camera.viewport.intersect(
        drawing.current.localBounds
          .scale(transform.scale)
          .rotate(transform.rotation)
          .translate(transform.pos)
      );

      if (!e.components[ComponentTypes.Offscreen] && offscreen) {
        e.emit('exitviewport', new ExitViewPortEvent(e));
        e.addComponent(new OffscreenComponent());
      }

      if (e.components[ComponentTypes.Offscreen] && !offscreen) {
        e.emit('enterviewport', new EnterViewPortEvent(e));
        e.removeComponent(ComponentTypes.Offscreen);
      }
    }

    const sortedEntities = this._sortedDrawingTree.list();

    for (const entity of sortedEntities) {
      const transform = entity.components[ComponentTypes.Transform] as TransformComponent;
      const drawing = entity.components[ComponentTypes.Drawing] as DrawingComponent;
      if (entity.components[ComponentTypes.Offscreen]) {
        console.log('offscreen');
        continue;
      }

      // Establish camera offset per entity
      if (transform && transform.coordPlane === CoordPlane.World) {
        this.ctx.save();
        if (this.engine && this.engine.currentScene && this.engine.currentScene.camera) {
          this.engine.currentScene.camera.draw(this.ctx);
        }
      }

      if (drawing.current) {
        drawing.current.tick(delta);
      } else {
        // TODO this is not good, couples collider geometry with drawing system
        if (isActor(entity) && entity.color && entity.body && entity.body.collider && entity.body.collider.shape) {
          this.ctx.save();
          this.ctx.translate(transform.pos.x, transform.pos.y);
          this.ctx.rotate(transform.rotation);

          this.ctx.translate(-entity.width * entity.anchor.x, -entity.height * entity.anchor.y);

          entity.body.collider.shape.draw(
            this.ctx,
            entity.color,
            new Vector(entity.width * entity.anchor.x, entity.height * entity.anchor.y)
          );
          this.ctx.restore();
        }
      }

      // TODO delete replace these this with a utility method
      const preDraw = () => {
        if (hasPreDraw(entity)) {
          this.ctx.save();
          this.ctx.translate(
            -drawing.width * drawing.noDrawingAnchor.x + drawing.offset.x,
            -drawing.height * drawing.noDrawingAnchor.y + drawing.offset.y
          );

          entity.onPreDraw(this.ctx, delta);
          this.ctx.restore();
        }
      };

      const postDraw = () => {
        if (hasPostDraw(entity)) {
          this.ctx.save();
          this.ctx.translate(
            -drawing.width * drawing.noDrawingAnchor.x + drawing.offset.x,
            -drawing.height * drawing.noDrawingAnchor.y + drawing.offset.y
          );
          entity.onPostDraw(this.ctx, delta);
          this.ctx.restore();
        }
      };

      // TODO handle offscreen
      if ((drawing.current && drawing.current.loaded) || hasPostDraw(entity) || hasPreDraw(entity)) {
        // const { /* offset: componentOffset, */ scale: componentScale } = drawing;
        // const { /* width, height, anchor, offset, */ scale } = drawing.current;
        // const totalScale = componentScale.scale(scale);
        // const totalOffset = componentOffset.add(offset);

        // Setup transform
        this.ctx.save();
        this.ctx.translate(transform.pos.x, transform.pos.y);
        this.ctx.rotate(transform.rotation);
        // this.ctx.scale(totalScale.x, totalScale.y);

        entity.emit('predraw', new PreDrawEvent(this.ctx, delta, entity));
        preDraw();
        if (drawing.current && drawing.visible) {
          drawing.onPreDraw(this.ctx, delta);

          // TODO handle sprite effects

          if (drawing.current) {
            drawing.current.draw(this.ctx, 0, 0);
          }

          drawing.onPostDraw(this.ctx, delta);
        }
        postDraw();
        entity.emit('postdraw', new PostDrawEvent(this.ctx, delta, entity));

        this.ctx.restore();
      }

      if (transform && transform.coordPlane === CoordPlane.World) {
        // Apply camera world offset
        this.ctx.restore();
      }
    }
  }

  preupdate(_engine: Engine, _delta: number): void {
    // Clear frame
    this.ctx.clearRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);
    this.ctx.fillStyle = _engine.backgroundColor.toString();
    this.ctx.fillRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);
  }
}
