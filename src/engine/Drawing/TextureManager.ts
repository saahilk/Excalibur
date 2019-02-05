import { Texture } from '../Resources/Texture';
import { IDrawable } from '../Interfaces/IDrawable';
import { ISpriteEffect } from './SpriteEffects';
import { Vector } from '../Algebra';
import { clamp } from '../Util/Util';

// TODO Needs to implement IDrawable
export class ManagedSprite implements IDrawable {
  public id: number;
  private _width: number;
  private _height: number;
  private _sx: number;
  private _sy: number;
  private _atlas: TextureManager;

  /**
   *
   * @param atlas
   * @param id
   * @param sx Source x coordinate in the atlas
   * @param sy Source y coordinate in the atlas
   * @param width
   * @param height
   */
  constructor(atlas: TextureManager, id: number, sx: number, sy: number, width: number, height: number) {
    this.id = id;
    this._width = width;
    this._height = height;
    this._sx = sx;
    this._sy = sy;
    this._atlas = atlas;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get drawWidth(): number {
    return this.width * this.scale.x;
  }

  public get drawHeight(): number {
    return this.height * this.scale.y;
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    var xpoint = this.drawWidth * this.anchor.x;
    var ypoint = this.drawHeight * this.anchor.y;
    ctx.translate(x, y);
    ctx.rotate(this.rotation);

    if (this.flipHorizontal) {
      ctx.translate(this.drawWidth, 0);
      ctx.scale(-1, 1);
    }

    if (this.flipVertical) {
      ctx.translate(0, this.drawHeight);
      ctx.scale(1, -1);
    }
    ctx.drawImage(
      // Source image
      <HTMLCanvasElement>this._atlas.canvas,
      // Source coordinates
      this._sx,
      this._sy,
      this._width,
      this._height,
      // Destination coordinates
      -xpoint,
      -ypoint,
      this.drawWidth,
      this.drawHeight
    );
    ctx.restore();
  }

  flipVertical: boolean = false;
  flipHorizontal: boolean = false;

  public rotation: number = 0.0;
  public anchor: Vector = Vector.Zero;
  public scale: Vector = Vector.One;

  addEffect(_effect: ISpriteEffect): void {
    throw new Error('Method not implemented.');
  }
  removeEffect(_effect: ISpriteEffect): void;
  removeEffect(_index: number): void;
  removeEffect(_param: any): void;
  removeEffect(_param: any) {
    throw new Error('Method not implemented.');
  }
  clearEffects(): void {
    throw new Error('Method not implemented.');
  }
  reset(): void {
    // pass
  }
}

// TextureManager vs TextureAtals vs Atlas?
export class TextureManager {
  private static _CURRENT_ID = 0;
  private _canvas: HTMLCanvasElement | OffscreenCanvas;
  private _ctx: CanvasRenderingContext2D;
  private _width = 100;
  private _height = 100;
  private _currentX = 0;
  private _currentY = 0;
  // private _currentWidth = 0;
  // private _currentHeight = 0;

  private _sprites: { [spriteId: number]: ManagedSprite } = {};

  constructor(public suppressOffscreen: boolean = false) {
    /**
     * TODO:
     * [ ] Create backing canvas, maybe with offscreencanavas ctor or fall back to normal canvas
     * [ ] Figure out an efficient packing algorthim
     * [ ] Switch to managed sprite
     *  */

    this._contextProvider();
  }

  private _contextProvider(): CanvasRenderingContext2D {
    // TODO do some profiling here
    if ((<any>window).OffscreenCanvas && !this.suppressOffscreen) {
      this._canvas = new OffscreenCanvas(this._width, this._height);
      this._ctx = this._canvas.getContext('2d', { alpha: false });
    } else {
      // todo canvas needs to be added to the dom to hint memcopy to the gpu
      // todo find source in chromium to back this assertion up
      this._canvas = document.createElement('canvas');
      this._ctx = this._canvas.getContext('2d', { alpha: false });
    }
    return null;
  }

  public get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }

  public get canvas(): HTMLCanvasElement | OffscreenCanvas {
    return this._canvas;
  }

  // todo should this do texture loading?
  // TODO validate inputs
  /**
   *
   * @param tex Loaded texture
   * @param x X coordinate in the loaded texture to make a sprite from, default is 0
   * @param y Y coordinate in the loaded texture to make a sprite from, default is 0
   * @param width Width to take make a sprite from the loaded texture, min is 1, max is the natural width of the loaded texture
   * @param height Hight to take make a sprit from the loaded texture, min is 1, max is the natural height of the loaded texture
   */
  public loadIntoAtlas(tex: Texture, x: number = 0, y: number = 0, width?: number, height?: number): ManagedSprite {
    this._ctx.drawImage(tex.image, this._currentX, this._currentY, tex.image.naturalWidth, tex.image.naturalHeight);
    const sprite = this.createSprite(
      this._currentX + x,
      this._currentY + y,
      clamp(width, 1, tex.image.naturalWidth),
      clamp(height, 1, tex.image.naturalHeight)
    );
    tex.id = sprite.id;
    this._currentX += tex.image.naturalWidth;
    this._currentY = Math.max(this._currentY, tex.image.naturalHeight);

    // TODO when we establish a max width this will become important
    // we will need to repack the sprites if they go over the max width
    // this._currentWidth = this._currentX;
    // this._currentHeight = this._currentY
    return sprite;
  }

  public createSprite(x: number, y: number, width: number, height: number, id?: number): ManagedSprite {
    const newId = TextureManager._CURRENT_ID++;
    if (!id) {
      return (this._sprites[newId] = new ManagedSprite(this, newId, x, y, width, height));
    } else {
      return (this._sprites[newId] = new ManagedSprite(this, id, x, y, width, height));
    }
  }
}
