import { System } from './System';
import { Entity } from './Entity';
import { Type, ComponentTypes } from './Types';

export class RigidBodySystem implements System {
  public readonly types: Type[] = [ComponentTypes.Body];
  update(_entities: Entity[], _delta: number): void {
    // pass
  }
}
