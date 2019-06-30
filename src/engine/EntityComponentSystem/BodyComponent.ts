import { Component } from './component';
import { BuiltinComponentType, ComponentType } from './ComponentTypes';
import { Body } from '../Collision/Body';
import { Entity } from './Entity';

export class BodyComponent extends Body implements Component {
  public dependencies: ComponentType[] = [BuiltinComponentType.Transform];
  public readonly type = BuiltinComponentType.Body;
  public owner: Entity = null;
  public clone(): BodyComponent {
    return null;
  }
}
