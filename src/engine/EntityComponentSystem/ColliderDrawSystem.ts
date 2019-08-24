import { ComponentType, BuiltinComponentType } from './ComponentTypes';
import { System } from './System';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { Body } from '../Collision/Body';
import { DrawColliderComponent } from './DrawColliderComponent';
import { Vector } from '../Algebra';
import { TransformComponent, CoordPlane } from './TransformComponent';
import { DrawingComponent } from './DrawingComponent';

export class ColliderDrawSystem implements System {
  public readonly types: ComponentType[] = [BuiltinComponentType.Body, BuiltinComponentType.DrawCollider];

  public ctx: CanvasRenderingContext2D;
  constructor(public engine: Engine) {
    this.ctx = engine.ctx;
  }

  public update(entities: Entity[], _delta: number): void {
    for (const entity of entities) {
      const body = entity.components[BuiltinComponentType.Body] as Body;
      const maybeDrawing = entity.components[BuiltinComponentType.Drawing] as DrawingComponent;
      if (maybeDrawing && maybeDrawing.current) {
        return;
      }
      if (body) {
        const transform = body.transform;
        this._pushCameraTransform(transform);
        const colliderDraw = entity.components[BuiltinComponentType.DrawCollider] as DrawColliderComponent;
        const { color, anchor } = colliderDraw;
        const { width, height } = body.collider.localBounds;

        this.ctx.save();
        this.ctx.translate(transform.pos.x, transform.pos.y);
        this.ctx.rotate(transform.rotation);

        this.ctx.translate(-width * anchor.x, -height * anchor.y);

        body.collider.shape.draw(this.ctx, color, new Vector(width * anchor.x, height * anchor.y));
        this.ctx.restore();
        this._popCameraTransform(transform);
      }
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
