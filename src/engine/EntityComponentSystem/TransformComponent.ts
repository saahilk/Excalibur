import { Component } from './component';
import { BuiltinComponentType } from './ComponentTypes';
import { Vector } from '../Algebra';
import { Entity } from './Entity';

export enum CoordPlane {
  World = 'world',
  Screen = 'screen'
}

export interface Transform {
  pos: Vector;
  vel: Vector;
  acc: Vector;

  rotation: number;
  angularVelocity: number;
  torque: number;

  scale: Vector;

  z: number;
}

export class TransformComponent implements Component, Transform {
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

  public old: Transform = {
    pos: Vector.Zero,
    vel: Vector.Zero,
    acc: Vector.Zero,

    rotation: 0,
    angularVelocity: 0,
    torque: 0,

    z: -1, // z needs to be different at first for draw tree ordering
    scale: Vector.One
  };

  public captureOldTransform() {
    // Capture old values before integration step updates them
    this.old.pos.setTo(this.pos.x, this.pos.y);
    this.old.vel.setTo(this.vel.x, this.vel.y);
    this.old.acc.setTo(this.acc.x, this.acc.y);

    this.old.rotation = this.rotation;
    this.old.angularVelocity = this.angularVelocity;
    this.old.torque = this.torque;

    this.old.z = this.z;

    this.old.scale.setTo(this.scale.x, this.scale.y);
  }

  public get changed(): boolean {
    return (
      !this.pos.equals(this.old.pos) ||
      this.rotation !== this.old.rotation ||
      !this.vel.equals(this.old.vel) ||
      this.angularVelocity !== this.old.angularVelocity ||
      !this.acc.equals(this.old.acc) ||
      this.torque !== this.old.torque ||
      this.z !== this.old.z ||
      !this.scale.equals(this.old.scale)
    );
  }

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
