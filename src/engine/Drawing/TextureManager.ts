import { Texture } from '../Resources/Texture';
import { IDrawable } from '../Interfaces/IDrawable';
import { ISpriteEffect } from './SpriteEffects';
import { Vector } from '../Algebra';
import { clamp } from '../Util/Util';
import { ISpriteArgs } from './Sprite';

// TODO Needs to implement IDrawable
export class ManagedSprite implements IDrawable {
  public id: number;
  private _width: number;
  private _height: number;
  private _x: number;
  private _y: number;
  public static manager: TextureManager;

  constructor(config: ISpriteArgs);
  constructor(image: Texture, x: number, y: number, width: number, height: number);
  constructor(id?: number, sx?: number, sy?: number, width?: number, height?: number);
  /**
   *
   * @param atlas
   * @param id
   * @param x Source x coordinate in the atlas
   * @param y Source y coordinate in the atlas
   * @param width
   * @param height
   */
  constructor(imageOrConfigOrId: Texture | ISpriteArgs | number, x?: number, y?: number, width?: number, height?: number) {
    this._width - width;
    this._height = height;
    this._x = x;
    this._y = y;

    if (typeof imageOrConfigOrId === 'number') {
      this.id = imageOrConfigOrId;
    } else if (imageOrConfigOrId instanceof Texture) {
      this.id = imageOrConfigOrId.id;
    } else {
      const { x, y, width, height, image } = imageOrConfigOrId;
      this.id = image.id;
      this._width = width;
      this._height = height;
      this._x = x;
      this._y = y;
    }
    if (this.id) {
      this.useReference(this.id);
    }
    ManagedSprite.manager.addSprite(this);
  }

  // Todo i'm not thrilled about methods that side effect
  public useReference(id: number) {
    // todo this violets the style guide
    const reference = ManagedSprite.manager.getSprite(id);
    const x = reference._x + this._x;
    const y = reference._y + this._y;
    const width = clamp(this._width, 1, reference._width);
    const height = clamp(this._height, 1, reference._height);
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  public clone() {
    return ManagedSprite.manager.addSprite(this);
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
      <HTMLCanvasElement>ManagedSprite.manager.canvas,
      // Source coordinates
      this._x,
      this._y,
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
    //throw new Error('Method not implemented.');
  }
  removeEffect(_effect: ISpriteEffect): void;
  removeEffect(_index: number): void;
  removeEffect(_param: any): void;
  removeEffect(_param: any) {
    //throw new Error('Method not implemented.');
  }
  clearEffects(): void {
    //throw new Error('Method not implemented.');
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

  public get canvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>this._canvas;
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
    const sprite = this.addSprite(
      new ManagedSprite({
        x: this._currentX + x,
        y: this._currentY + y,
        width: clamp(width, 1, tex.image.naturalWidth),
        height: clamp(height, 1, tex.image.naturalHeight)
      })
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

  public getSprite(id: number) {
    // TODO this violates style guid
    return this._sprites[id];
  }

  public addSprite(sprite: ManagedSprite): ManagedSprite {
    const newId = TextureManager._CURRENT_ID++;
    sprite.id = newId;
    return (this._sprites[newId] = sprite);
  }
}
