import { Body } from '../Collision/Body';
import { ComponentTypes, Component } from './Component';

export class PhysicsComponent implements Component {
  readonly type = ComponentTypes.Physics;
  public body: Body = new Body(null); // ticking time bomb

  public clone() {
    return new PhysicsComponent();
  }
}
