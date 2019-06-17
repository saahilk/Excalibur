import { Vector } from '../Algebra';
import { GraphicsContext } from './GraphicsContext';

export interface CanDraw {
  draw(ctx: GraphicsContext, x: number, y: number): void;
}

export class Graphic implements CanDraw {
  private _childGraphics: Graphic[] = [];

  /**
   * Update state
   */
  public tick(_delta: number) {}

  /**
   *
   * @param graphic Graphic to add
   * @param offset Pixel offset
   */
  public add(graphic: Graphic, _offset: Vector): Graphic {
    this._childGraphics.push(graphic);
    return this;
  }

  draw(_ctx: GraphicsContext, _x: number, _y: number) {
    // sort child graphics
  }
}
