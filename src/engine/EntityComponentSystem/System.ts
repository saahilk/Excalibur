import { ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { Message, MaybeObserver } from '../Util/Observable';

/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 */
export interface System extends MaybeObserver<AddedSystemEntity | RemovedSystemEntity> {
  
  /**
   * The types of entities that this system operates on
   */
  readonly types: ComponentType[];

  /**
   * Update all entities that match this system's types
   * @param entities Entities to update that match this system's typse
   * @param delta Time in milliseconds
   */
  update(entities: Entity[], delta: number): void;

  /**
   * Optionally run a preupdate before the system processes matching entities
   * @param engine
   * @param delta Time in milliseconds since the last frame
   */
  preupdate?: (engine: Engine, delta: number) => void;

  /**
   * Optionally run a postupdate after the system processes matching entities
   * @param engine
   * @param delta Time in milliseconds since the last frame
   */
  postupdate?: (engine: Engine, delta: number) => void;
}

/**
 * An [[Entity]] with [[Component]] types that matches a [[System]] types exists in the current scene.
 */
export class AddedSystemEntity implements Message<Entity> {
  readonly type: 'Entity Added' = 'Entity Added';
  constructor(public data: Entity) {}
}

export function isAddedSystemEntity(x: Message<Entity>): x is AddedSystemEntity {
  return !!x && x.type === 'Entity Added';
}

/**
 * An [[Entity]] with [[Component]] types that no longer matches a [[System]] types exists in the current scene.
 */
export class RemovedSystemEntity implements Message<Entity> {
  readonly type: 'Entity Removed' = 'Entity Removed';
  constructor(public data: Entity) {}
}

export function isRemoveSystemEntity(x: Message<Entity>): x is RemovedSystemEntity {
  return !!x && x.type === 'Entity Removed';
}
