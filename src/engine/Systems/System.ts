import { Type } from '../Components/Component';
import { Engine } from '../Engine';
import { Entity } from '../Entity';

/**
 * Systems process entities that have component types that match the system types
 */
export interface System {
  readonly types: Type[];
  process(entity: Entity, delta: number): void;
}

export interface PreProcess {
  before(engine: Engine, delta?: number): void;
}

export interface PostProcess {
  after(engine: Engine, delta?: number): void;
}
