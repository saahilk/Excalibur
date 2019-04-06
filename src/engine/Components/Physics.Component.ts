import { Body } from '../Collision/Body';
import { ComponentTypes, Component } from './Component';

/**
 * Can collide with other objects with physics
 */
export class RigidPhysicsComponent implements Component {
  readonly type = ComponentTypes.Physics;
  public body: Body = new Body(null); // ticking time bomb

  public clone() {
    return new RigidPhysicsComponent();
  }
}
