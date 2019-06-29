import { Component } from './component';
import { BuiltinComponentType } from './Types';
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
    // TODO clone should copy current values
    // TODO utility for cloning, maybe a .props that has cloning utilities
    return new TransformComponent();
  }
}
