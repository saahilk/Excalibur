import { TextureManager } from './TextureManager';

import { clamp } from '../Util/Util';

import { ISpriteEffect } from './SpriteEffects';
import { IDrawable } from '../Interfaces/IDrawable';
import { ISpriteArgs } from './Sprite';
import { Texture } from '../Resources/Texture';
import { Vector } from '../Algebra';

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
      this.id = image ? image.id : null;
      this._width = width;
      this._height = height;
      this._x = x;
      this._y = y;
    }
    if (this.id !== null) {
      this.useReference(this.id);
    }
    TextureManager.addSprite(this);
  }

  // Todo i'm not thrilled about methods that side effect
  public useReference(id: number) {
    // todo this violets the style guide
    const reference = TextureManager.getSprite(id);
    if (!reference) return;
    const x = reference._x + this._x;
    const y = reference._y + this._y;
    const width = clamp(this._width, 1, reference._width);
    const height = clamp(this._height, 1, reference._height);
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  public set(spriteArgs: ISpriteArgs) {
    const { x, y, width, height } = spriteArgs;
    this._width = width;
    this._height = height;
    this._x = x;
    this._y = y;
  }

  public clone() {
    return TextureManager.addSprite(this);
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
