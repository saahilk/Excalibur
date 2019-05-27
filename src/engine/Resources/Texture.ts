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
    this._sprite = new Sprite(this, 0, 0, 0, 0);
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

  private _onResourceLoaded(resolve: (value?: HTMLImageElement | PromiseLike<HTMLImageElement>) => void) {
    this.image.addEventListener('load', () => {
      this._isLoaded = true;
      this.width = this._sprite.width = this.image.naturalWidth;
      this.height = this._sprite.height = this.image.naturalHeight;
      resolve(this.image);
    });
  }

  private _loadTexture(): Promise<HTMLImageElement> {
    if (this.path.indexOf('data:image/') > -1) {
      const complete = new Promise<HTMLImageElement>((resolve) => {
        this.image = new Image();
        this._onResourceLoaded(resolve);
        this.image.src = this.path;
      });
      return complete;
    } else {
      const complete = new Promise<HTMLImageElement>((resolve, reject) => {
        const loaded = super.load();
        this.image = new Image();
        loaded.then(
          () => {
            this._onResourceLoaded(resolve);
            this.image.src = super.getData();
          },
          () => {
            reject('Error loading texture.');
          }
        );
      });
      return complete;
    }
  }

  public asSprite(): Sprite {
    return this._sprite;
  }
}
