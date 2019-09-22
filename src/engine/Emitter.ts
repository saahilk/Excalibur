import { Entity } from './EntityComponentSystem/Entity';
import { TransformComponent, BuiltinComponentType } from './EntityComponentSystem';
import { Vector } from './Algebra';
import { Engine } from './Engine';

export interface EmitterOptions {
  pos: Vector;
  prototype: Entity;
}

export class Emitter extends Entity {
  private _engine: Engine;
  public prototype: Entity;
  public get transform(): TransformComponent {
    return this.components[BuiltinComponentType.Transform] as TransformComponent;
  }

  constructor(options?: Partial<EmitterOptions>) {
    super();
    const transform = new TransformComponent();
    this.addComponent(transform);

    const { pos, prototype } = options || { pos: this.transform.pos, prototype: null };
    transform.pos = pos;
    this.prototype = prototype;
  }

  public onInitialize(engine: Engine) {
    this._engine = engine;
  }

  /**
   * Ooptionally apply specific logic to entities spawn
   * @param _entity
   */
  public onSpawn(_entity: Entity) {
    // override me
  }

  public spawn(number: number = 1): Entity[] {
    let entities: Entity[] = [];
    if (this._engine) {
      for (let i = 0; i < number; i++) {
        if (this.prototype) {
          const instance = this.prototype.clone();
          const transform = instance.components[BuiltinComponentType.Transform] as TransformComponent;
          if (transform) {
            transform.pos = this.transform.pos.clone();
          }
          this.onSpawn(instance);
          this._engine.currentScene.add(instance);
          entities.push(instance);
        }
      }
    }
    return entities;
  }
}
