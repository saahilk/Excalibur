import { System } from './System';
import { ComponentTypes } from '../Components/Component';

export class RigidBodyCollisionSystem implements System {
  public readonly types = [ComponentTypes.Physics, ComponentTypes.Transform];

  process(entity: Entity, delta: number): void {
    throw new Error('Method not implemented.');
  }
}
