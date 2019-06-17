import { Type } from './Types';
import { Entity } from './Entity';
import { Engine } from '../Engine';

export interface System {
  readonly types: Type[];

  update(entities: Entity[], delta: number): void;
  preupdate(engine: Engine, delta: number): void;
  postupdate(engine: Engine, delta: number): void;
}
