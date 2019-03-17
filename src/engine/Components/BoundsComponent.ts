import { Component, ComponentTypes } from './Component';
import { BoundingBox } from '../Collision/Index';
import { Vector } from '../Algebra';

export function isBounds(x: Component): x is BoundsComponent {
  return !!x && x.type === ComponentTypes.Bounds;
}

export class BoundsComponent implements Component {
  readonly type = ComponentTypes.Bounds;

  public box = new BoundingBox();
  public anchor = Vector.Half;

  public clone() {
    let bounds = new BoundsComponent();
    bounds.box = this.box.clone();
    bounds.anchor = this.anchor.clone();
    return bounds;
  }
}
