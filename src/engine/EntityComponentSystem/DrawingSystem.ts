import { System } from './System';
import { Type, ComponentTypes } from './Types';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { TransformComponent } from './TransformComponent';
import { DrawingComponent } from './DrawingComponent';
import { PreDrawEvent, PostDrawEvent } from '../Events';
import { isActor } from '../Actor';
import { Vector } from '../Algebra';
import { hasPreDraw, hasPostDraw } from '../Drawing/HasPreDraw';

export class DrawingSystem implements System {
  readonly types: Type[] = [ComponentTypes.Transform, ComponentTypes.Drawing];

  public ctx: CanvasRenderingContext2D;
  constructor(public engine: Engine) {
    this.ctx = engine.ctx;
  }

  onEntityAdd(_entity: Entity) {
    // todo draw tree
  }

  onEntityRemove(_entity: Entity) {
    // o draw tree
  }

  /**
   * Update is called with enities that have a transform and drawing component
   */
  update(entities: Entity[], delta: number): void {
    // TODO this is a bad idea `.sort` is not stable
    const sortedEntities = entities.sort((a, b) => {
      const pos1 = a.components[ComponentTypes.Transform] as TransformComponent;
      const pos2 = b.components[ComponentTypes.Transform] as TransformComponent;
      return pos1.z - pos2.z;
    });

    for (const entity of sortedEntities) {
      const transform = entity.components[ComponentTypes.Transform] as TransformComponent;
      const drawing = entity.components[ComponentTypes.Drawing] as DrawingComponent;

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
    }
  }

  preupdate(_engine: Engine, _delta: number): void {
    // Clear frame
    this.ctx.clearRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);
    this.ctx.fillStyle = _engine.backgroundColor.toString();
    this.ctx.fillRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);

    // Todo move this into normal draw to do 'UI' actors
    // Establish camera offset
    this.ctx.save();
    if (this.engine && this.engine.currentScene && this.engine.currentScene.camera) {
      this.engine.currentScene.camera.draw(this.ctx);
    }
  }

  postupdate(_engine: Engine, _delta: number): void {
    // Apply camera offset
    this.ctx.restore();
  }
}
