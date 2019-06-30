import { Vector } from '../Algebra';
import { Component } from './component';
import { BuiltinComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { Drawable } from '../Drawing/Drawable';
import { HasPreDraw, HasPostDraw } from '../Drawing/HasPreDraw';

export interface HasTick {
  tick(delta: number): void;
}

export interface CanCanvasDraw {
  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
}

export interface Loaded {
  loaded: boolean;
}

export type Graphic = HasTick & CanCanvasDraw & Loaded;

export interface DrawingOptions {
  /**
   * Name of current graphic to use
   */
  current?: string;

  /**
   * Optional visible flag, if the drawing component is not visible it will not be displayed
   */
  visible?: boolean;

  // TODO handle opacity

  /**
   * List of graphics
   */
  graphics?: { [graphicName: string]: Drawable };

  /**
   * If no drawing is specified, the width to use for draw calculations.
   * For example in a custom draw with anchor in onPreDraw or onPostDraw
   */
  noDrawingWidth?: number;

  /**
   * If no drawing is specified, the height to use for draw calculations.
   * For example in a custom draw with anchor in onPreDraw or onPostDraw
   */
  noDrawingHeight?: number;

  /**
   * Optional anchor override in relative to width and height of the current drawing, otherwise the current drawing anchor is used
   */
  noDrawingAnchor?: ex.Vector;

  /**
   * Optional offset in absolute pixels to shift all graphics in this component from each graphic's anchor (default is top left corner)
   */
  offset?: ex.Vector;

  /**
   * Optional rotation to apply to each graphic in this component
   */
  rotation?: number;
}

/**
 * Component to manage drawings, using with the position component
 */
export class DrawingComponent implements Component, HasPreDraw, HasPostDraw {
  public readonly type = BuiltinComponentType.Drawing;
  public owner: Entity = null;

  private _currentDrawing: Drawable;
  private _graphics: { [graphicName: string]: Drawable } = {};
  constructor(options?: DrawingOptions) {
    // Defaults
    options = {
      visible: this.visible,
      noDrawingWidth: this.noDrawingWidth,
      noDrawingHeight: this.noDrawingHeight,
      noDrawingAnchor: this.noDrawingAnchor,
      ...options
    };

    const { current, visible, graphics, offset, noDrawingWidth, noDrawingHeight, noDrawingAnchor } = options;

    this._graphics = graphics || {};
    this.offset = offset || this.offset;
    this.visible = !!visible;
    this.noDrawingWidth = noDrawingWidth;
    this.noDrawingHeight = noDrawingHeight;
    this.noDrawingAnchor = noDrawingAnchor;

    if (current && this._graphics[current]) {
      this._currentDrawing = this._graphics[current];
    }
  }

  public noDrawingAnchor: Vector = Vector.Half;

  /**
   * Sets or gets wether any drawing should be visible in this component
   */
  public visible: boolean = true;

  /**
   * Offset to apply to all drawings in this component
   */
  public offset: Vector = Vector.Zero;

  /**
   * Rotation to apply to all drawings in this component
   */
  public rotation: number = 0;

  /**
   * If no drawing is specified, the height to use for draw calculations.
   * For example in a custom draw with anchor in onPreDraw or onPostDraw
   */
  public noDrawingWidth: number = 0;

  /**
   * If no drawing is specified, the height to use for draw calculations.
   * For example in a custom draw with anchor in onPreDraw or onPostDraw
   */
  public noDrawingHeight: number = 0;

  /**
   * Returns the currently displayed graphic, null if hidden
   */
  public get current(): Drawable {
    return this._currentDrawing;
  }

  /**
   * Returns all graphics associated with this component
   */
  public get graphics(): { [graphicName: string]: Drawable } {
    return this._graphics;
  }

  /**
   * Adds a graphic to this component
   * @param graphic
   */
  public add(name: string, graphic: Drawable): void {
    this._graphics[name] = graphic;
    if (name === 'default') {
      this.show('default');
    }
  }

  /**
   * Show a graphic by name, returns a promise that resolves when graphic has finished displaying
   */
  public show(graphicName: string): Promise<Drawable> {
    this._currentDrawing = this.graphics[graphicName];

    // Todo does this make sense for looping animations
    // how do we know this??
    return Promise.resolve(this._currentDrawing);
  }

  /**
   * Immediately show nothing
   */
  public hide(): Promise<void> {
    this._currentDrawing = null;
    return Promise.resolve();
  }

  /**
   * Returns the current drawings width in pixels, as it would appear on screen factoring width.
   * If there isn't a current drawing returns [[DrawingComponent.noDrawingWidth]].
   */
  public get width(): number {
    if (this._currentDrawing) {
      return this._currentDrawing.drawWidth;
    }
    return this.noDrawingWidth;
  }

  /**
   * Returns the current drawings height in pixels, as it would appear on screen factoring height.
   * If there isn't a current drawing returns [[DrawingComponent.noDrawingHeight]].
   */
  public get height(): number {
    if (this._currentDrawing) {
      return this._currentDrawing.drawHeight;
    }
    return this.noDrawingHeight;
  }

  public onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number) {
    // override me
  }

  public onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number) {
    // override me
  }

  /**
   * Returns a shallow copy of this component
   */
  clone(): DrawingComponent {
    return this;
  }
}
