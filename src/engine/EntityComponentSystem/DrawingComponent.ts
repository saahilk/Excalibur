import { Vector } from '../Algebra';
import { Component } from './component';
import { ComponentTypes } from './Types';
import { Entity } from './Entity';
import { Drawable } from '../Drawing/Drawable';

export interface HasTick {
  tick(delta: number): void;
}

export interface CanDraw {
  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
}

export interface Loaded {
  loaded: boolean;
}

export type Graphic = HasTick & CanDraw & Loaded;

export interface DrawingOptions {
  /**
   * Name of current graphic to use
   */
  current?: string;

  /**
   * Optional visible flag, if the drawing component is not visible it will not be displayed
   */
  visible?: boolean;

  /**
   * List of graphics
   */
  graphics?: { [graphicName: string]: Drawable };
  /**
   * Optional offset in absolute pixels to shift all graphics in this component from each graphic's anchor (default is top left corner)
   */
  offset?: ex.Vector;
  /**
   * Optional scale to apply to each graphic in this component, does not scale any offset if used, a new offset must be specified.
   */
  scale?: ex.Vector;

  /**
   * Optional rotation to apply to each graphic in this component
   */
  rotation?: number;
}

/**
 * Component to manage drawings, using with the position component
 */
export class DrawingComponent implements Component {
  public readonly type = ComponentTypes.Drawing;
  public owner: Entity = null;

  private _currentDrawing: Drawable;
  private _graphics: { [graphicName: string]: Drawable } = {};
  constructor(options?: DrawingOptions) {
    options = { visible: true, ...options };
    const { current, visible, graphics, offset, scale } = options;
    this._graphics = graphics || {};
    this.offset = offset || this.offset;
    this.scale = scale || this.scale;
    this.visible = !!visible;

    if (current && this._graphics[current]) {
      this._currentDrawing = this._graphics[current];
    }
  }

  public visible: boolean = true;
  // TODO do we want these even?
  public offset: Vector = Vector.Zero;
  public scale: Vector = Vector.One;
  public rotation: number = 0;

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
   * Returns a shallow copy of this component
   */
  clone(): DrawingComponent {
    return this;
  }
}
