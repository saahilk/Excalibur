import { Entity, RemovedComponent, AddedComponent, isAddedComponent, isRemovedComponent } from './Entity';
import { Component } from './Component';
import { Observer } from '../Util/Observable';
import { ComponentType } from './Types';
import { System, AddedSystemEntity, RemovedSystemEntity } from './System';
import { Util } from '..';

export class EntityRepository implements Observer<RemovedComponent | AddedComponent> {
  private _dirty: { [compositeKey: string]: boolean } = {};
  private _memo: { [compositeKey: string]: Entity[] } = {};

  public systems: System[] = [];
  public typeIndex: { [type: string]: Entity[] } = {}; // todo entity arrays are slow, binary search?
  public entityIndex: { [id: string]: Entity } = {};

  private _invalidQueriesForType(type: ComponentType) {
    // Flag cached queries containing these types as dirty
    const queries = Object.keys(this._memo).filter((k) => k.indexOf(type) !== -1);
    for (const q of queries) {
      this._dirty[q] = true;
    }
  }

  private _addOrUpdateFromIndexes(entity: Entity, component: Component) {
    // Initialize if no index for type exists
    if (!this.typeIndex[component.type]) {
      this.typeIndex[component.type] = [];
    }

    // Only add to the index if it doesn't already exist
    const index = this.typeIndex[component.type].indexOf(entity);
    if (index === -1) {
      this.typeIndex[component.type].push(entity);
    }

    this._invalidQueriesForType(component.type);
    this._addToSystems(entity);
  }

  private _removeFromIndexes(entity: Entity, component: Component) {
    // Initialize if no index for type exists
    if (!this.typeIndex[component.type]) {
      this.typeIndex[component.type] = [];
    }

    // Remove if entity is found in index
    const index = this.typeIndex[component.type].indexOf(entity);
    if (index !== -1) {
      this.typeIndex[component.type].splice(index, 1);
    }

    this._invalidQueriesForType(component.type);
    this._removeFromSystems(entity, component);
  }

  notify(message: RemovedComponent | AddedComponent): void {
    if (isAddedComponent(message)) {
      this._addOrUpdateFromIndexes(message.data.entity, message.data.component);
    }

    if (isRemovedComponent(message)) {
      this._removeFromIndexes(message.data.entity, message.data.component);
    }
  }

  private _addToSystems(entity: Entity) {
    for (const s of this.systems) {
      let matches = true;
      for (const systemType of s.types) {
        matches = matches && entity.types.indexOf(systemType) > -1;
      }
      if (matches && s.notify) {
        s.notify(new AddedSystemEntity(entity));
      }
    }
  }

  public addSystem(system: System): void {
    const entities = this.queryByTypes(system.types);
    for (const e of entities) {
      if (system.notify) {
        system.notify(new AddedSystemEntity(e));
      }
    }
    this.systems.push(system);
  }

  private _removeFromSystems(entity: Entity, component: Component) {
    for (const s of this.systems) {
      let matches = true;
      for (const systemType of s.types) {
        if (s.types.indexOf(component.type) === -1) {
          matches = false;
          break;
        }
        matches = matches && [...entity.types, component.type].indexOf(systemType) > -1;
      }
      if (matches && s.notify) {
        s.notify(new RemovedSystemEntity(entity));
      }
    }
  }

  public removeSystem(system: System): void {
    const entities = this.queryByTypes(system.types);
    for (const e of entities) {
      if (system.notify) {
        system.notify(new RemovedSystemEntity(e));
      }
    }
    Util.removeItemFromArray(system, this.systems);
  }

  public addEntity(entity: Entity): void {
    if (entity) {
      this.entityIndex[entity.id] = entity;
      for (const c in entity.components) {
        this._addOrUpdateFromIndexes(entity, entity.components[c]);
      }
      entity.changes.register(this);
    }
  }

  public removeEntity(id: number) {
    const entity = this.entityIndex[id];
    delete this.entityIndex[id];
    if (entity) {
      for (const c in entity.components) {
        this._removeFromIndexes(entity, entity.components[c]);
      }
      entity.changes.unregister(this);
    }
  }

  public queryById(id: number): Entity {
    return this.entityIndex[id];
  }

  public queryByTypes(types: ComponentType[]): Entity[] {
    const queryKey = this._buildKey(types);
    // We've seen this query before and nothing has changed
    if (!(this._dirty[queryKey] !== null || this._dirty[queryKey] !== undefined) && !this._dirty[queryKey]) {
      return this._memo[queryKey] || [];
    }

    // TODO more efficient query possible
    // 1. This grabs all the entities for each type in 1 big list
    let results: Entity[] = [];
    for (const type of types) {
      if (this.typeIndex[type]) {
        results = results.concat(this.typeIndex[type]);
      }
    }
    // 2. This does a distinct on the entities that match the overall [type] query
    // 3. Cache the results of the query
    this._memo[queryKey] = results.filter((value, index, array) => {
      return array.indexOf(value) === index && this._queryMatchesEntity(types, value.types);
    });

    this._dirty[queryKey] = false;
    return this._memo[queryKey];
  }

  private _queryMatchesEntity(queryTypes: ComponentType[], entityTypes: ComponentType[]) {
    let matches = true;
    for (const type of queryTypes) {
      matches = matches && entityTypes.indexOf(type) > -1;
      if (!matches) {
        return false;
      }
    }
    return matches;
  }

  private _buildKey(types: ComponentType[]) {
    const key = types.sort((a, b) => a.localeCompare(b)).join('+');
    return key;
  }
}
