import { Component } from './component';
import { ComponentTypes } from './Types';
import { Body } from '../Collision/Body';
import { Entity } from './Entity';

export class BodyComponent extends Body implements Component {
  public readonly type = ComponentTypes.Body;
  public owner: Entity = null;
  public clone(): BodyComponent {
    return null;
  }
}
