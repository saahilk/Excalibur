import { Component, Type } from './Components/Component';
import { Class } from './Class';
import { Observerable, Message } from './Observable';

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
  private static ID = 0;
  public id: number = Entity.ID++;

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
  // not IE11 compatible...
  public components: ComponentMap = new Proxy({}, this._handleChanges);
  public changes: Observerable<AddedComponent | RemovedComponent> = new Observerable<AddedComponent | RemovedComponent>();

  public clone(): Entity {
    let newEntity = new Entity();
    for (let c in this.types) {
      newEntity.addComponent(this.components[c].clone());
    }
    return newEntity;
  }

  public addComponent(component: Component | Entity) {
    // If you use an entity as a "prefab" or template
    if (component instanceof Entity) {
      for (let c in component.components) {
        this.addComponent(component.components[c].clone());
      }
      // Normal component case
    } else {
      this.components[component.type] = component;
    }
  }

  public removeComponent(componentOrType: string | Component) {
    if (typeof componentOrType === 'string') {
      delete this.components[componentOrType];
    } else {
      delete this.components[componentOrType.type];
    }
  }

  public hasComponent(type: string): boolean {
    return !!this.components[type];
  }
}
