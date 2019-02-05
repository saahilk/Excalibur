interface HTMLCanvasElement {
  getContext(type: '2d', options: { alpha: boolean }): CanvasRenderingContext2D;
}

declare class OffscreenCanvas {
  constructor(width: number, height: number);
  getContext(type: '2d', options: { alpha: boolean }): CanvasRenderingContext2D;
}
