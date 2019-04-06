import { System } from './System';
import { ComponentTypes } from '../Components/Component';
import { Entity } from '../Entity';
import { Engine } from '../Engine';

export class RigidBodyCollisionSystem implements System {
  public readonly types = [ComponentTypes.Physics, ComponentTypes.Transform];

  process(entity: Entity, delta: number): void {
    throw new Error('Method not implemented.');
  }
}
