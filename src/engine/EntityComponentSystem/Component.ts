import { Type } from './Types';
import { Entity } from './Entity';

/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity posesses
 *
 */
export interface Component {
  /**
   * Optionally list any component types this component depends on
   * If the owner entity does not have these components, new components will be added to the entity
   */
  readonly dependencies?: Type[];
  readonly type: Type;
  owner: Entity;
  clone(): Component;
}
