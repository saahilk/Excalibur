import { System } from './System';
import { Type, ComponentTypes } from './Types';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { TransformComponent } from './TransformComponent';
import { DrawingComponent } from './DrawingComponent';
import { PreDrawEvent, PostDrawEvent } from '../Events';

export class DrawingSystem implements System {
  readonly types: Type[] = [ComponentTypes.Transform, ComponentTypes.Drawing];

  constructor(public ctx: CanvasRenderingContext2D) {}
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
      }

      if (drawing.current && drawing.current.loaded) {
        const { scale: componentScale, offset: componentOffset } = drawing;
        const { width, height, scale, anchor, offset } = drawing.current;
        const totalScale = componentScale.scale(scale);
        const totalOffset = componentOffset.add(offset);

        // Setup transform
        this.ctx.save();
        this.ctx.translate(transform.pos.x, transform.pos.y);
        this.ctx.rotate(transform.rotation);
        this.ctx.scale(totalScale.x, totalScale.y);

        entity.emit('predraw', new PreDrawEvent(this.ctx, delta, entity));

        // Perform anchor and offset calculations
        const offsetX = -width * totalScale.x * anchor.x + totalOffset.x;
        const offsetY = -height * totalScale.y * anchor.y + totalOffset.y;

        // TODO handle effects effects

        if (drawing.visible) {
          drawing.current.draw(this.ctx, offsetX, offsetY);
        }

        entity.emit('postdraw', new PostDrawEvent(this.ctx, delta, entity));
        this.ctx.restore();
      }
    }
  }

  preupdate(_engine: Engine, _delta: number): void {
    _engine.ctx.clearRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);
    _engine.ctx.fillStyle = _engine.backgroundColor.toString();
    _engine.ctx.fillRect(0, 0, _engine.canvasWidth, _engine.canvasHeight);
  }

  postupdate(_engine: Engine, _delta: number): void {}
}
