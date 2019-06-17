export class GraphicsContext {
  private _ctx: CanvasRenderingContext2D;
  constructor(_canvasElement: HTMLCanvasElement) {
    this._ctx = _canvasElement.getContext('2d');
  }

  drawImage(image: any, x: number, y: number): void {
    this._ctx.drawImage(image, x, y);
  }

  drawCircle(_x: number, _y: number, _radius: number): void {}
}
