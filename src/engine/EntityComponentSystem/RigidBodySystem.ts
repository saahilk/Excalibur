import { System, AddedSystemEntity, RemovedSystemEntity, isAddedSystemEntity, isRemoveSystemEntity } from './System';
import { Entity } from './Entity';
import { ComponentType, BuiltinComponentType } from './ComponentTypes';
import { Engine } from '../Engine';
import { CollisionProcessor } from '../Collision/CollisionProcessor';
import { DynamicTreeCollisionProcessor } from '../Collision/DynamicTreeCollisionProcessor';
import { Physics } from '../Physics';
import { addItemToArray } from '../Util/Util';
import { Body } from '../Collision/Body';

export class RigidBodySystem implements System {
  public readonly types: ComponentType[] = [BuiltinComponentType.Body];

  private _processor: CollisionProcessor = new DynamicTreeCollisionProcessor();
  private _bodies: Body[] = [];

  constructor(public engine: Engine) {

  }

  notify(message: AddedSystemEntity | RemovedSystemEntity) {
    if (isAddedSystemEntity(message)) {
      addItemToArray(message.data.components[BuiltinComponentType.Body] as Body, this._bodies);
    }

    if (isRemoveSystemEntity(message)) {
      // TODO not great
      this._bodies = this._bodies.filter(b => b.owner);
    }
  }

  update(_entities: Entity[], delta: number): void {
    // Run the broadphase and narrowphase
    if (Physics.enabled) {
      const beforeBroadphase = Date.now();
      this._processor.update(this._bodies, delta);
      let pairs = this._processor.broadphase(this._bodies, delta, this.engine.stats.currFrame);
      const afterBroadphase = Date.now();

      const beforeNarrowphase = Date.now();
      let iter: number = Physics.collisionPasses;
      const collisionDelta = delta / iter;
      while (iter > 0) {
        // Run the narrowphase
        pairs = this._processor.narrowphase(pairs, this.engine.stats.currFrame);
        // Run collision resolution strategy
        pairs = this._processor.resolve(pairs, collisionDelta, Physics.collisionResolutionStrategy);

        this._processor.runCollisionStartEnd(pairs);

        iter--;
      }

      const afterNarrowphase = Date.now();
      this.engine.stats.currFrame.physics.broadphase = afterBroadphase - beforeBroadphase;
      this.engine.stats.currFrame.physics.narrowphase = afterNarrowphase - beforeNarrowphase;
    }
  }
}
