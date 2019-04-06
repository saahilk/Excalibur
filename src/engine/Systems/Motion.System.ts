import { System } from './System';
import { Entity } from '../Entity';
import { Engine } from '../Engine';
import { ComponentTypes } from '../Components/Component';
import { isTransform } from '../Components/Transform.Component';

export class MotionSystem implements System {
  readonly types: string[] = [ComponentTypes.Transform];

  // is it better to get a list of entities or a list of components here...
  process(entity: Entity, delta: number): void {
    let component = entity.components[ComponentTypes.Transform];
    if (isTransform(component)) {
      // Update placements based on linear algebra
      let seconds = delta / 1000;

      let totalAcc = component.acc.clone();

      // Only active vanilla actors are affected by global acceleration
      // if (this.collisionType === CollisionType.Active) {
      //     totalAcc.addEqual(Physics.acc);
      // }

      component.vel.addEqual(totalAcc.scale(seconds));
      component.pos.addEqual(component.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

      // component.rx += this.torque * (1.0 / this.moi) * seconds;
      component.rotation += component.rx * seconds;

      component.scale.x += (component.sx * delta) / 1000;
      component.scale.y += (component.sy * delta) / 1000;

      // if (!this.scale.equals(this.oldScale)) {
      //     // change in scale effects the geometry
      //     this._geometryDirty = true;
      // }

      // Update physics body
      // this.body.update();
      // this._geometryDirty = false;
    }
  }
}
