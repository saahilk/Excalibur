import { Component, ComponentTypes } from './Component';

export function isOffscreen(x: Component): x is OffscreenComponent {
  return !!x && x.type === ComponentTypes.Offscreen;
}

export class OffscreenComponent implements Component {
  readonly type = ComponentTypes.Offscreen;

  public offscreen: boolean = false;

  public clone(): OffscreenComponent {
    let newC = new OffscreenComponent();

    return newC;
  }
}
