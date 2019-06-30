import { System } from './System';
import { Entity } from './Entity';
import { ComponentType, BuiltinComponentType } from './ComponentTypes';

export class RigidBodySystem implements System {
  public readonly types: ComponentType[] = [BuiltinComponentType.Body];
  update(_entities: Entity[], _delta: number): void {
    // pass
  }
}
