import { Component } from './Component';
import { Entity } from './Entity';
import { BuiltinComponentType, ComponentType } from './Types';

export class OffscreenComponent implements Component {
  public readonly type: ComponentType = BuiltinComponentType.Offscreen;
  owner: Entity;
  clone(): Component {
    return new OffscreenComponent();
  }
}
