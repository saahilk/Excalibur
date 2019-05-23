import { Resource } from './Resource';
import { Sprite } from '../Drawing/Sprite';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 *
 * [[include:Textures.md]]
 */
export class Texture extends Resource<HTMLImageElement> {
  /**
   * The width of the texture in pixels
   */
  public width: number;

  /**
   * The height of the texture in pixels
   */
  public height: number;

  private _isLoaded: boolean = false;
  private _sprite: Sprite = null;
  private _textureLoadedPromise: Promise<HTMLImageElement>;

  /**
   * Populated once loading is complete
   */
  public image: HTMLImageElement;

  /**
   * @param path       Path to the image resource
   * @param bustCache  Optionally load texture with cache busting
   */
  constructor(public path: string, public bustCache = true) {
    super(path, 'blob', bustCache);
  }

  /**
   * Returns true if the Texture is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Begins loading the texture and returns a promise to be resolved on completion
   */
  public load(): Promise<HTMLImageElement> {
    if (!this._textureLoadedPromise) {
      this._textureLoadedPromise = this._loadTexture();
    }
    return this._textureLoadedPromise;
  }

  private _loadTexture(): Promise<HTMLImageElement> {
    let complete: Promise<HTMLImageElement>;
    if (this.path.indexOf('data:image/') > -1) {
      this.image = new Image();
      this.image.addEventListener('load', () => {
        this.width = this.image.naturalWidth;
        this.height = this.image.naturalHeight;
        complete = new Promise<HTMLImageElement>((resolve) => {
          resolve(this.image);
        });
      });
      this.image.src = this.path;
    } else {
      complete = new Promise<HTMLImageElement>((resolve, reject) => {
        const loaded = super.load();
        this.image = new Image();
        loaded.then(
          () => {
            this.image.addEventListener('load', () => {
              this._isLoaded = true;
              this.width = this.image.naturalWidth;
              this.height = this.image.naturalHeight;
              resolve(this.image);
            });
            this.image.src = super.getData();
          },
          () => {
            reject('Error loading texture.');
          }
        );
      });
    }
    return complete;
  }

  public asSprite(): Sprite {
    if (!this._sprite) {
      this._sprite = new Sprite(this, 0, 0, this.width, this.height);
    }
    return this._sprite;
  }
}
