import { Component } from './Component';
import { Entity } from './Entity';
import { ComponentTypes, Type } from './Types';

export class OffscreenComponent implements Component {
  public readonly type: Type = ComponentTypes.Offscreen;
  owner: Entity;
  clone(): Component {
    return new OffscreenComponent();
  }
}
