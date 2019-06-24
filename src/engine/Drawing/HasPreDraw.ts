export function hasPreDraw(x: any): x is HasPreDraw {
  return x && !!x.onPreDraw;
}

export interface HasPreDraw {
  onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number): void;
}

export function hasPostDraw(x: any): x is HasPostDraw {
  return x && !!x.onPostDraw;
}

export interface HasPostDraw {
  onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number): void;
}
