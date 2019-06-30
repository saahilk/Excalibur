import { Component } from './component';
import { BuiltinComponentType } from './ComponentTypes';
import { Vector } from '../Algebra';
import { Entity } from './Entity';

export enum CoordPlane {
  World = 'world',
  Screen = 'screen'
}

export class TransformComponent implements Component {
  public readonly type = BuiltinComponentType.Transform;
  public owner: Entity = null;

  public coordPlane = CoordPlane.World;

  public pos: Vector = Vector.Zero;
  public vel: Vector = Vector.Zero;
  public acc: Vector = Vector.Zero;

  // Z-index
  public z: number = 0;
  public oldZ: number = -1;

  public rotation: number = 0;
  public angularVelocity: number = 0;
  public torque: number = 0;

  public scale: Vector = Vector.One;

  public clone() {
    // TODO utility for cloning, maybe a .props that has cloning utilities

    const clonedTransform = new TransformComponent();
    clonedTransform.coordPlane = this.coordPlane;

    clonedTransform.pos = this.pos.clone();
    clonedTransform.vel = this.vel.clone();
    clonedTransform.acc = this.acc.clone();

    clonedTransform.z = this.z;
    clonedTransform.oldZ = this.oldZ;

    clonedTransform.rotation = this.rotation;
    clonedTransform.angularVelocity = this.angularVelocity;
    clonedTransform.torque = this.torque;

    clonedTransform.scale = this.scale.clone();

    return clonedTransform;
  }
}
