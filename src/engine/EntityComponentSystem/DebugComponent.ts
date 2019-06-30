import { Component } from './Component';
import { BuiltinComponentType, ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { Color } from '../Drawing/Color';

export class DebugComponent implements Component {
  public readonly type: ComponentType = BuiltinComponentType.Debug;
  public owner: Entity;

  public color: Color = Color.Yellow;
  public showEntityId = true;
  public showPosition = true;
  public showDrawingBounds = true;
  public showUnitCircle = false;

  public clone(): DebugComponent {
    return new DebugComponent();
  }
}
