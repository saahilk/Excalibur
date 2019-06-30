import { System } from './System';
import { BuiltinComponentType, ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { PreDebugDrawEvent, PostDebugDrawEvent } from '../Events';
import { TransformComponent, CoordPlane } from './TransformComponent';
import { DrawingComponent } from './DrawingComponent';
import { DebugComponent } from './DebugComponent';

export class DebugDrawSystem implements System {
  public readonly types: ComponentType[] = [BuiltinComponentType.Transform, BuiltinComponentType.Drawing, BuiltinComponentType.Debug];
  public ctx: CanvasRenderingContext2D;

  constructor(public engine: Engine) {
    this.ctx = engine.ctx;
  }

  update(entities: Entity[], _delta: number): void {
    for (const entity of entities) {
      const transform = entity.components[BuiltinComponentType.Transform] as TransformComponent;
      const drawing = entity.components[BuiltinComponentType.Drawing] as DrawingComponent;
      const debug = entity.components[BuiltinComponentType.Debug] as DebugComponent;

      this._pushCameraTransform(transform);

      // Setup transform
      this.ctx.save();
      this.ctx.translate(transform.pos.x, transform.pos.y);

      // TODO do we need anchoring in debug draw???
      // if (drawing.current) {
      //   this.ctx.translate(-drawing.width * drawing.current.anchor.x, -drawing.height * drawing.current.anchor.y);
      // } else {
      //   this.ctx.translate(-drawing.width * drawing.noDrawingAnchor.x, -drawing.height * drawing.noDrawingAnchor.y)
      // }

      entity.emit('predebugdraw', new PreDebugDrawEvent(this.ctx, entity));

      // TODO Collider Debug Draw
      // Draw actor bounding box
      // this.body.collider.debugDraw(this.ctx);
      // const bb = this.body.collider.localBounds.translate(this.getWorldPos());
      // bb.debugDraw(this.ctx);

      // Draw actor Id
      if (debug.showEntityId) {
        this.ctx.fillStyle = debug.color.toString();
        this.ctx.fillText('id: ' + entity.id, 10, 10);
      }

      // Draw actor anchor Vector
      if (debug.showPosition) {
        this.ctx.fillStyle = debug.color.toString();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillText('pos: ' + transform.pos.toString(), 10, 20);
      }

      // Draw drawing bounds
      if (debug.showDrawingBounds && drawing.current) {
        drawing.current.localBounds.rotate(transform.rotation).debugDraw(this.ctx, debug.color);
      }

      // Culling Box debug draw
      // for (let j = 0; j < this.traits.length; j++) {
      //   if (this.traits[j] instanceof Traits.OffscreenCulling) {
      //     (<Traits.OffscreenCulling>this.traits[j]).cullingBox.debugDraw(ctx);
      //   }
      // }

      // Unit Circle debug draw
      if (debug.showUnitCircle) {
        this.ctx.strokeStyle = debug.color.toString();
        this.ctx.beginPath();
        const radius = Math.min(drawing.width, drawing.height);
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.stroke();
        const ticks: { [key: string]: number } = {
          '0 Pi': 0,
          'Pi/2': Math.PI / 2,
          Pi: Math.PI,
          '3/2 Pi': (3 * Math.PI) / 2
        };

        const oldFont = this.ctx.font;
        for (const tick in ticks) {
          this.ctx.fillStyle = debug.color.toString();
          this.ctx.font = '14px';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(tick, Math.cos(ticks[tick]) * (radius + 10), Math.sin(ticks[tick]) * (radius + 10));
        }

        this.ctx.font = oldFont;
      }

      // Draw child actors
      // for (let i = 0; i < this.children.length; i++) {
      //   this.children[i].debugDraw(ctx);
      // }

      entity.emit('postdebugdraw', new PostDebugDrawEvent(this.ctx, entity));
      this.ctx.restore();
      this._popCameraTransform(transform);
    }
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
}
