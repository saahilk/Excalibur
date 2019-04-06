import { Component, ComponentTypes } from './Component';
import { Vector } from '../Algebra';

export function isTransform(x: Component): x is TransformComponent {
  return !!x && x.type === ComponentTypes.Transform;
}

export enum CoordPlane {
  World = 'world',
  Screen = 'screen'
}

/**
 * Has position and motion in the world or screen
 */
export class TransformComponent implements Component, HasTransform {
  readonly type = ComponentTypes.Transform;

  public coordPlane = CoordPlane.World;

  public pos: Vector = Vector.Zero;
  public oldPos: Vector = Vector.Zero;

  public vel: Vector = Vector.Zero;
  public oldVel: Vector = Vector.Zero;

  public acc: Vector = Vector.Zero;
  public oldAcc: Vector = Vector.Zero;

  public rotation: number = 0;
  public rx: number = 0;

  public scale: Vector = Vector.One;
  public oldScale: Vector = Vector.One;

  public sx: number = 0;
  public sy: number = 0;

  clone(): TransformComponent {
    let newComponent = new TransformComponent();

    newComponent.pos = this.pos.clone();
    newComponent.oldPos = this.oldPos.clone();

    newComponent.vel = this.vel.clone();
    newComponent.oldVel = this.oldVel.clone();

    newComponent.acc = this.acc.clone();
    newComponent.oldAcc = this.oldAcc.clone();

    newComponent.rotation = this.rotation;
    newComponent.rx = this.rx;

    newComponent.scale = this.scale.clone();
    newComponent.oldScale = this.oldScale.clone();

    return newComponent;
  }
}

export interface HasPosition {
  pos: Vector;
  oldPos: Vector;
}

export interface HasVelocity {
  vel: Vector;
  oldVel: Vector;
}

export interface HasRotation {
  rotation: number;
  rx: number;
}

export interface HasScale {
  scale: Vector;
  oldScale: Vector;
}

export interface HasTransform extends HasPosition, HasVelocity, HasRotation, HasScale {}
