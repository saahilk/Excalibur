import { Texture } from '../Resources/Texture';
import { clamp } from '../Util/Util';
import { ManagedSprite } from './ManagedSprite';

// TODO Needs to implement IDrawable

// TextureManager vs TextureAtals vs Atlas?
export class TextureManager {
  private static _CURRENT_ID = 0;
  private static _sprites: { [spriteId: number]: ManagedSprite } = {};

  private _canvas: HTMLCanvasElement | OffscreenCanvas;
  private _ctx: CanvasRenderingContext2D;
  private _width = 1000;
  private _height = 1000;
  //   private _maxX = 0;
  //   private _maxY = 0;
  private _currentX = 0;
  private _currentY = 0;
  // private _currentWidth = 0;
  // private _currentHeight = 0;

  constructor(public suppressOffscreen: boolean = false) {
    /**
     * TODO:
     * [x] Create backing canvas, maybe with offscreencanavas ctor or fall back to normal canvas
     * [ ] Figure out an efficient packing algorthim
     * [ ] Switch to managed sprite
     *  */

    this._contextInitializer(this._width, this._height);
  }

  private _contextInitializer(width: number, height: number) {
    // TODO do some profiling here
    if ((<any>window).OffscreenCanvas && !this.suppressOffscreen) {
      this._canvas = new OffscreenCanvas(width, height);
      this._ctx = this._canvas.getContext('2d', { alpha: true });
    } else {
      // todo canvas needs to be added to the dom to hint memcopy to the gpu
      // todo find source in chromium to back this assertion up
      this._canvas = document.createElement('canvas');
      this._ctx = this._canvas.getContext('2d', { alpha: true });
    }
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
  public load(tex: Texture, id?: number, x: number = 0, y: number = 0, width?: number, height?: number): ManagedSprite {
    // Resize if new image wont fit
    if (this._needsResize(tex.image.naturalWidth, tex.image.naturalHeight)) {
      this._resize();
    }

    // Pack location

    // Add image to atlas
    this._ctx.drawImage(tex.image, this._currentX, this._currentY, tex.image.naturalWidth, tex.image.naturalHeight);

    // Build the atlas coordinate
    const atlasX = this._currentX + x;
    const atlasY = this._currentY + y;
    const atlasWidth = clamp(width || tex.image.naturalWidth, 1, tex.image.naturalWidth);
    const atlasHeight = clamp(height || tex.image.naturalHeight, 1, tex.image.naturalHeight);

    // load a reserved sprite
    let sprite: ManagedSprite = null;
    if (id !== null && TextureManager.getSprite(id)) {
      sprite = TextureManager.getSprite(id);
      sprite.set({
        x: atlasX,
        y: atlasY,
        width: atlasWidth,
        height: atlasHeight
      });

      // load a new sprite
    } else {
      sprite = TextureManager.addSprite(
        new ManagedSprite({
          x: atlasX,
          y: atlasY,
          width: atlasWidth,
          height: atlasHeight,
          id: TextureManager._nextId()
        })
      );
      tex.id = sprite.id;
    }

    // let nextX = this._currentX + tex.image.naturalWidth;
    // // let nextY = this._currentY + tex.image.naturalHeight;
    // if (nextX > this._width) {
    //     nextX = 0;
    // }
    this._currentX += tex.image.naturalWidth;
    this._currentY = Math.max(this._currentY, tex.image.naturalHeight);

    // TODO when we establish a max width this will become important
    // we will need to repack the sprites if they go over the max width
    // this._currentWidth = this._currentX;
    // this._currentHeight = this._currentY
    return sprite;
  }

  // https://www.gamedev.net/forums/topic/683912-sprite-packing-algorithm-explained-with-example-code/
  // https://jsfiddle.net/jLchftot/
  //   public pack(x: number, y: number, width: number, height: number) {
  // let nextX = x + width;
  // let nextY = y + height;

  // Ordering by height is important in this algo
  // Place the first sprite at (0,0)
  // Attempt to place it in the min/max boundaries
  // If not put in the same row, if the new sprite width added will be less than max height
  // Otherwise shift down, increasing the height

  //   }

  private _needsResize(newWidth: number, newHeight: number) {
    return this._currentX + newWidth > this._width && this._currentY + newHeight > this._height;
  }

  private _resize() {
    // Double the size on each resize
    this._width *= 2;
    this._height *= 2;
    this._contextInitializer(this._width, this._height);
  }

  public static reserveForTexture(tex: Texture): ManagedSprite {
    const newId = TextureManager._CURRENT_ID++;
    tex.id = newId;
    return (this._sprites[newId] = new ManagedSprite(newId, 0, 0, 0, 0));
  }

  public static getSprite(id: number) {
    // TODO this violates style guid
    if (TextureManager._sprites[id]) {
      return TextureManager._sprites[id];
    }
    return null;
  }

  private static _nextId() {
    const newId = TextureManager._CURRENT_ID++;
    return newId;
  }

  public static addSprite(sprite: ManagedSprite): ManagedSprite {
    return (TextureManager._sprites[sprite.id] = sprite);
  }
}
