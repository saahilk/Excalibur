import { System } from './System';
import { BuiltinComponentType, ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { LifetimeComponent } from './LifetimeComponent';
import { Engine } from '../Engine';

export class LifetimeSystem implements System {
  public readonly types: ComponentType[] = [BuiltinComponentType.Lifetime];
  private _dead: Entity[] = [];
  public update(entities: Entity[], delta: number) {
    const seconds = delta / 1000;
    for (const entity of entities) {
      const lifetime = entity.components[BuiltinComponentType.Lifetime] as LifetimeComponent;
      lifetime.current -= seconds;
      if (lifetime.current <= 0) {
        entity.active = false;
        this._dead.push(entity);
      }
    }
  }

  public postupdate(engine: Engine, _delta: number) {
    for (const e of this._dead) {
      engine.currentScene.remove(e);
    }
    this._dead.length = 0;
  }
}
