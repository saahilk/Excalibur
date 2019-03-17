import { Component, ComponentTypes } from './Component';
import { IDrawable } from '../Interfaces/Index';

export function isDrawing(x: Component): x is DrawingComponent {
  return !!x && x.type === ComponentTypes.Drawing;
}

export class DrawingComponent implements Component {
  readonly type: string = ComponentTypes.Drawing;

  public currentDrawing: IDrawable = null;

  clone(): DrawingComponent {
    let newC = new DrawingComponent();
    newC.currentDrawing = this.currentDrawing;
    return newC;
  }
}
