import { Vector } from '../Algebra';
import { Component } from './component';
import { BuiltinComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { Drawable } from '../Drawing/Drawable';
import { HasPreDraw, HasPostDraw } from '../Drawing/HasPreDraw';

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
      ...options
    };

    const { current, visible, graphics, offset } = options;

    this._graphics = graphics || {};
    this.offset = offset || this.offset;
    this.visible = !!visible;

    if (current && this._graphics[current]) {
      this._currentDrawing = this._graphics[current];
    }
  }

  /**
   * Sets or gets wether any drawing should be visible in this component
   */
  public visible: boolean = true;

  /**
   * Offset to apply to all drawings in this component if set, if null the drawing's offset is respected
   */
  public offset: Vector | null = null;

  /**
   * Anchor to apply to all drawings in this component if set, if null the drawing's anchor is respected
   */
  public anchor: Vector | null = null;

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
   * Adds a graphic to this component, if the name is "default" or not specified, it will be shown by default without needing to call `show("default")`
   * @param graphic
   */
  public add(graphic: Drawable): Drawable;
  public add(name: string, graphic: Drawable): Drawable;
  public add(nameOrDrawable: string | Drawable, graphic?: Drawable): Drawable {
    let name = 'default';
    let graphicToSet: Drawable = null;
    if (typeof nameOrDrawable === 'string') {
      name = nameOrDrawable;
      graphicToSet = graphic;
    } else {
      graphicToSet = nameOrDrawable;
    }

    this._graphics[name] = graphicToSet;
    if (name === 'default') {
      this.show('default');
    }
    return graphicToSet;
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
    return 0;
  }

  /**
   * Returns the current drawings height in pixels, as it would appear on screen factoring height.
   * If there isn't a current drawing returns [[DrawingComponent.noDrawingHeight]].
   */
  public get height(): number {
    if (this._currentDrawing) {
      return this._currentDrawing.drawHeight;
    }
    return 0;
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
