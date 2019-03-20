import { ComponentTypes, Component } from './Component';

export class CameraBoundComponent implements Component {
  readonly type = ComponentTypes.CameraBound;
  public clone(): CameraBoundComponent {
    return new CameraBoundComponent();
  }
}
