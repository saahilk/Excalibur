import { System } from './System';
import { ComponentTypes } from '../Components/Component';
import { Entity } from '../Entity';
import { Engine } from '../Engine';
import { isTransform } from '../Components/Transform.Component';
import { isBounds } from '../Components/Bounds.Component';
import { isDrawing } from '../Components/Drawing.Component';
import { isOffscreen } from '../Components/OffscreenComponent';

export class DrawingSystem implements System {
  readonly types: string[] = [ComponentTypes.Transform, ComponentTypes.Bounds, ComponentTypes.Drawing, ComponentTypes.Offscreen];
  public ctx: CanvasRenderingContext2D;
  constructor(public engine: Engine) {
    this.ctx = engine.ctx;
  }

  process(entity: Entity, delta: number): void {
    let transform = entity.components[ComponentTypes.Transform];
    let bounds = entity.components[ComponentTypes.Bounds];
    let drawingComp = entity.components[ComponentTypes.Drawing];
    let offscreen = entity.components[ComponentTypes.Offscreen];
    if (isTransform(transform) && isBounds(bounds) && isDrawing(drawingComp) && isOffscreen(offscreen) && offscreen.offscreen) {
      this.ctx.save();
      this.ctx.translate(transform.pos.x, transform.pos.y);
      this.ctx.rotate(transform.rotation);
      this.ctx.scale(transform.scale.x, transform.scale.y);

      // translate canvas by anchor offset
      this.ctx.save();
      this.ctx.translate(-(bounds.box.width * bounds.anchor.x), -(bounds.box.height * bounds.anchor.y));

      // todo fire predraw event
      // this._predraw(this.ctx, delta);

      if (drawingComp.currentDrawing) {
        let drawing = drawingComp.currentDrawing;
        // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
        var offsetX = (bounds.box.width - drawing.width * drawing.scale.x) * bounds.anchor.x;
        var offsetY = (bounds.box.height - drawing.height * drawing.scale.y) * bounds.anchor.y;

        // if (this._effectsDirty) {
        //     this._reapplyEffects(this.currentDrawing);
        //     this._effectsDirty = false;
        // }

        drawing.draw(this.ctx, offsetX, offsetY);
      } else {
        // todo move to color/shape systems
        // if (this.color) {
        //     this.ctx.fillStyle = this.color.toString();
        //     this.ctx.fillRect(0, 0, this._width, this._height);
        // }
      }
      this.ctx.restore();

      // Draw child actors
      // for (var i = 0; i < this.children.length; i++) {
      //     if (this.children[i].visible) {
      //         this.children[i].draw(this.ctx, delta);
      //     }
      // }

      // todo fire postdraw event
      // this._postdraw(this.ctx, delta);
      this.ctx.restore();
    }
  }
}
