import { System } from './System';
import { BuiltinComponentType, ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { TransformComponent } from './TransformComponent';
import { Body } from '../Collision/Body';
import { CollisionType } from '../Collision/CollisionType';
import { Physics } from '../Physics';

export class MotionSystem implements System {
  readonly types: ComponentType[] = [BuiltinComponentType.Transform];

  update(entities: Entity[], delta: number): void {
    for (const entity of entities) {
      const transform = entity.components[BuiltinComponentType.Transform] as TransformComponent;
      const body = entity.components[BuiltinComponentType.Body] as Body;

      transform.captureOldTransform();

      // Update placements based on linear algebra
      const seconds = delta / 1000;

      const totalAcc = transform.acc.clone();

      // Only active vanilla actors are affected by global acceleration
      if (body && body.collider.type === CollisionType.Active) {
        totalAcc.addEqual(Physics.acc);
      }

      transform.vel.addEqual(totalAcc.scale(seconds));
      transform.pos.addEqual(transform.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

      if (body) {
        transform.angularVelocity += transform.torque * (1.0 / body.collider.inertia) * seconds;
      }
      transform.rotation += transform.angularVelocity * seconds;

      // transform.scale.x += (this.sx * delta) / 1000;
      // transform.scale.y += (this.sy * delta) / 1000;
    }
  }
}
