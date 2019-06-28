import { Type } from './Types';
import { Entity } from './Entity';
import { Engine } from '../Engine';

export interface System {
  /**
   * The types of entities that this system operates on
   */
  readonly types: Type[];

  /**
   * When an entity is added that matches this system's types this method is called
   * @param entity
   */
  onEntityAdd?: (entity: Entity) => void;
  /**
   * When an entity no longer matches this system's types this method is called
   * @param entity
   */
  onEntityRemove?: (entity: Entity) => void;

  /**
   * Update all entities that match this system's types
   * @param entities Entities to update that match this system's typse
   * @param delta Time in milliseconds
   */
  update(entities: Entity[], delta: number): void;

  preupdate?: (engine: Engine, delta: number) => void;
  postupdate?: (engine: Engine, delta: number) => void;
}
