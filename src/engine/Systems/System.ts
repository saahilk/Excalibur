import { Type } from '../Components/Component';
import { Engine } from '../Engine';
import { Entity } from '../Entity';

/**
 * Systems process entities that have component types that match the system types
 */
export interface System {
  readonly types: Type[];
  process(entity: Entity, delta: number): void;
  before(engine: Engine, delta?: number): void;
  after(engine: Engine, delta?: number): void;
}
