import { Entity, RemovedComponent, AddedComponent, isAddedComponent, isRemovedComponent } from './Entity';
import { Type, Component } from './Components/Component';
import { Observer } from './Observable';

export class EntityRepository implements Observer<RemovedComponent | AddedComponent> {
  private _dirty: { [compositeKey: string]: boolean } = {};
  private _memo: { [compositeKey: string]: Entity[] } = {};

  public typeIndex: { [type: string]: Entity[] } = {}; // todo entity arrays are slow, binary search
  public entityIndex: { [id: string]: Entity } = {};

  private _invalidQueriesForType(type: Type) {
    // Flag cached queries containing these types as dirty
    let queries = Object.keys(this._memo).filter((k) => k.indexOf(type) !== -1);
    for (let q of queries) {
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
  }

  notify(message: RemovedComponent | AddedComponent): void {
    if (isAddedComponent(message)) {
      this._addOrUpdateFromIndexes(message.data.entity, message.data.component);
    }

    if (isRemovedComponent(message)) {
      this._removeFromIndexes(message.data.entity, message.data.component);
    }
  }

  public insert(entity: Entity) {
    this.entityIndex[entity.id] = entity;
    for (let c in entity.components) {
      this._addOrUpdateFromIndexes(entity, entity.components[c]);
    }
    entity.changes.register(this);
  }

  public remove(id: number) {
    delete this.entityIndex[id];
    let entity = this.entityIndex[id];
    for (let c in entity.components) {
      this._removeFromIndexes(entity, entity.components[c]);
    }
    entity.changes.unregister(this);
  }

  public queryById(id: number): Entity {
    return this.entityIndex[id];
  }

  public queryByTypes(types: Type[]): Entity[] {
    // We've seen this query before and nothing has changed
    if (!this._dirty[this._buildKey(types)]) {
      return this._memo[this._buildKey(types)] || [];
    }

    // TODO more efficient query possible
    // 1. This grabs all the entities for each type in 1 big list
    let results: Entity[] = [];
    for (let type of types) {
      results = results.concat(this.typeIndex[type]);
    }
    // 2. This does a distinct on the entities that match the overall [type] query
    // 3. Cache the results of the query
    let key = this._buildKey(types);
    this._memo[key] = results.filter((value, index, array) => {
      return array.indexOf(value) === index;
    });

    this._dirty[key] = false;
    return this._memo[key];
  }

  private _buildKey(types: Type[]) {
    const key = types.sort((a, b) => a.localeCompare(b)).join('+');
    return key;
  }
}
