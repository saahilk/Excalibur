import { Component } from "./Component";
import { BuiltinComponentType, ComponentType } from "./ComponentTypes";
import { Color } from "../Drawing/Color";
import { Vector } from "../Algebra";


export class DrawColliderComponent implements Component {
  public readonly type: ComponentType = BuiltinComponentType.DrawCollider;

  public color: Color = Color.Black;
  public anchor: Vector = Vector.Half;

  public clone(): DrawColliderComponent {
    const c = new DrawColliderComponent();
    c.color = this.color.clone();
    c.anchor = this.anchor.clone();
    return c;
  }
}