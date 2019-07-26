import { System, AddedSystemEntity, RemovedSystemEntity, isAddedSystemEntity, isRemoveSystemEntity } from './System';
import { ComponentType, BuiltinComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { TransformComponent, CoordPlane } from './TransformComponent';
import { DrawingComponent } from './DrawingComponent';
import { PreDrawEvent, PostDrawEvent, ExitViewPortEvent, EnterViewPortEvent } from '../Events';
import { SortedList } from '../Util/SortedList';
import { OffscreenComponent } from './OffscreenComponent';

export class DrawingSystem implements System {
  readonly types: ComponentType[] = [BuiltinComponentType.Transform, BuiltinComponentType.Drawing];

  private _sortedDrawingTree: SortedList<Entity> = new SortedList<Entity>((e) => {
    const transform = e.components[BuiltinComponentType.Transform] as TransformComponent;
    return transform.z;
  });

  public ctx: CanvasRenderingContext2D;
  constructor(public engine: Engine) {
    this.ctx = engine.ctx;
  }

  notify(message: AddedSystemEntity | RemovedSystemEntity) {
    if (isAddedSystemEntity(message)) {
      this._sortedDrawingTree.add(message.data);
      this._updateZ(message.data.components[BuiltinComponentType.Transform] as TransformComponent);
    }

    if (isRemoveSystemEntity(message)) {
      this._sortedDrawingTree.removeByComparable(message.data);
    }
  }

  private _updateZ(transform: TransformComponent) {
    transform.oldZ = transform.z;
  }

  /**
   * Update is called with enities that have a transform and drawing component
   */
  update(_entities: Entity[], delta: number): void {
    for (const e of _entities) {
      const transform = e.components[BuiltinComponentType.Transform] as TransformComponent;
      const drawing = e.components[BuiltinComponentType.Drawing] as DrawingComponent;

      // TODO perhaps observe this z-index change?
      this._applyZIndex(e, transform);
      this._applyOffscreenCulling(e, transform, drawing);
    }

    const sortedEntities = this._sortedDrawingTree.list();

    for (const entity of sortedEntities) {
      const transform = entity.components[BuiltinComponentType.Transform] as TransformComponent;
      const drawing = entity.components[BuiltinComponentType.Drawing] as DrawingComponent;

      // If offscreen, skip drawing
      if (entity.components[BuiltinComponentType.Offscreen]) {
        continue;
      }

      this._pushCameraTransform(transform);

      if (drawing.current) {
        drawing.current.tick(delta);
      } 

      // TODO delete replace these this with a utility method
      // const preDraw = () => {
      //   if (hasPreDraw(entity)) {
      //     this.ctx.save();
      //     this.ctx.translate(
      //       -drawing.width * drawing.noDrawingAnchor.x + drawing.offset.x,
      //       -drawing.height * drawing.noDrawingAnchor.y + drawing.offset.y
      //     );

      //     entity.onPreDraw(this.ctx, delta);
      //     this.ctx.restore();
      //   }
      // };

      // const postDraw = () => {
      //   if (hasPostDraw(entity)) {
      //     this.ctx.save();
      //     this.ctx.translate(
      //       -drawing.width * drawing.noDrawingAnchor.x + drawing.offset.x,
      //       -drawing.height * drawing.noDrawingAnchor.y + drawing.offset.y
      //     );
      //     entity.onPostDraw(this.ctx, delta);
      //     this.ctx.restore();
      //   }
      // };

      if (drawing.current && drawing.current.loaded && !entity.components[BuiltinComponentType.Offscreen]) {
        // Setup transform
        this.ctx.save();
        this.ctx.translate(transform.pos.x, transform.pos.y);
        this.ctx.rotate(transform.rotation);
        this.ctx.scale(transform.scale.x, transform.scale.x);

        entity.emit('predraw', new PreDrawEvent(this.ctx, delta, entity));
        // preDraw();
        if (drawing.current && drawing.visible) {
          drawing.onPreDraw(this.ctx, delta);

          // TODO handle sprite effects

          if (drawing.current) {
            drawing.current.draw(this.ctx, 0, 0);
          }

          drawing.onPostDraw(this.ctx, delta);
        }
        // postDraw();
        entity.emit('postdraw', new PostDrawEvent(this.ctx, delta, entity));

        this.ctx.restore();
      }

      this._popCameraTransform(transform);
    }
  }

  preupdate(_engine: Engine, _delta: number): void {
    // Clear frame
    this.ctx.clearRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);
    this.ctx.fillStyle = _engine.backgroundColor.toString();
    this.ctx.fillRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);
  }

  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform && transform.coordPlane === CoordPlane.World) {
      this.ctx.save();
      if (this.engine && this.engine.currentScene && this.engine.currentScene.camera) {
        this.engine.currentScene.camera.draw(this.ctx);
      }
    }
  }

  private _popCameraTransform(transform: TransformComponent) {
    if (transform && transform.coordPlane === CoordPlane.World) {
      // Apply camera world offset
      this.ctx.restore();
    }
  }

  private _applyZIndex(entity: Entity, transform: TransformComponent) {
    // Handle z index
    if (transform.z !== transform.oldZ) {
      const tempZ = transform.z;
      transform.z = transform.oldZ;
      this._sortedDrawingTree.removeByComparable(entity);
      transform.z = tempZ;
      this._sortedDrawingTree.add(entity);
      this._updateZ(transform);
    }
  }

  // Move to a separate system?
  private _applyOffscreenCulling(entity: Entity, transform: TransformComponent, drawing: DrawingComponent) {
    // Handle offscreen culling
    if (drawing && drawing.current) {
      const offscreen = !this.engine.currentScene.camera.viewport.intersect(
        drawing.current.localBounds
          .scale(transform.scale)
          .rotate(transform.rotation)
          .translate(transform.pos)
      );

      // Add offscreen component & emit events
      if (!entity.components[BuiltinComponentType.Offscreen] && offscreen) {
        entity.emit('exitviewport', new ExitViewPortEvent(entity));
        entity.addComponent(new OffscreenComponent());
      }

      if (entity.components[BuiltinComponentType.Offscreen] && !offscreen) {
        entity.emit('enterviewport', new EnterViewPortEvent(entity));
        entity.removeComponent(BuiltinComponentType.Offscreen);
      }
    }
  }
}
