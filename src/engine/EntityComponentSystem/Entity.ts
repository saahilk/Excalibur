import { Component } from './Component';

import { Observerable, Message } from '../Util/Observable';
import { Class } from '../Class';
import { Type } from './Types';

export interface EntityComponent {
  component: Component;
  entity: Entity;
}
export class AddedComponent implements Message<EntityComponent> {
  readonly type: 'Component Added' = 'Component Added';
  constructor(public data: EntityComponent) {}
}

export function isAddedComponent(x: Message<EntityComponent>): x is AddedComponent {
  return !!x && x.type === 'Component Added';
}

export class RemovedComponent implements Message<EntityComponent> {
  readonly type: 'Component Removed' = 'Component Removed';
  constructor(public data: EntityComponent) {}
}

export function isRemovedComponent(x: Message<EntityComponent>): x is RemovedComponent {
  return !!x && x.type === 'Component Removed';
}

export type ComponentMap = { [type: string]: Component };

export class Entity extends Class {
  private static _ID = 0;

  /**
   * The unique identifier for the entity
   */
  public id: number = Entity._ID++;

  /**
   * The types of the components on the Entity
   */
  public get types(): Type[] {
    return Object.keys(this.components);
  }

  private _handleChanges = {
    defineProperty: (obj: any, prop: any, descriptor: PropertyDescriptor) => {
      this.changes.notifyAll(
        new AddedComponent({
          component: descriptor.value as Component,
          entity: this
        })
      );
      obj[prop] = descriptor.value;
      return true;
    },
    deleteProperty: (obj: any, prop: any) => {
      if (prop in obj) {
        this.changes.notifyAll(
          new RemovedComponent({
            component: obj[prop] as Component,
            entity: this
          })
        );
        delete obj[prop];
        return true;
      }
      return false;
    }
  };
  // not IE11 compatible...we can hack around this by triggering handle changes if
  // TODO maybe this should be read only to avoid using proxy...
  public components: ComponentMap = new Proxy({}, this._handleChanges);
  public changes: Observerable<AddedComponent | RemovedComponent> = new Observerable<AddedComponent | RemovedComponent>();

  /**
   * Creates a deep copy of the entity and a copy of all its components
   */
  public clone(): Entity {
    const newEntity = new Entity();
    for (const c in this.types) {
      newEntity.addComponent(this.components[c].clone());
    }
    return newEntity;
  }

  public addComponent(component: Component | Entity) {
    // If you use an entity as a "prefab" or template
    if (component instanceof Entity) {
      for (const c in component.components) {
        this.addComponent(component.components[c].clone());
      }
      // Normal component case
    } else {
      component.owner = this;
      this.components[component.type] = component;
    }
  }

  public removeComponent(componentOrType: string | Component) {
    if (typeof componentOrType === 'string') {
      this.components[componentOrType].owner = null;
      delete this.components[componentOrType];
    } else {
      this.components[componentOrType.type].owner = null;
      delete this.components[componentOrType.type];
    }
  }

  public hasComponent(type: string): boolean {
    return !!this.components[type];
  }
}
