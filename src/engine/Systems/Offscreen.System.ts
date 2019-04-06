import { System } from './System';
import { Entity } from '../Entity';
import { Engine } from '../Engine';
import { ComponentTypes } from '../Components/Component';
import { isTransform } from '../Components/Transform.Component';
import { isOffscreen } from '../Components/OffscreenComponent';
import { isBounds } from '../Components/Bounds.Component';
import { ExitViewPortEvent, EnterViewPortEvent } from '../Events';

export class Offscreen implements System {
  readonly types: string[] = [ComponentTypes.Transform, ComponentTypes.Bounds, ComponentTypes.Offscreen];
  constructor(public engine: Engine) {}

  process(entity: Entity, delta: number): void {
    let transform = entity.components[ComponentTypes.Transform];
    let bounds = entity.components[ComponentTypes.Bounds];
    let offscreen = entity.components[ComponentTypes.Offscreen];
    if (isTransform(transform) && isOffscreen(offscreen) && isBounds(bounds)) {
      const events = entity.eventDispatcher;

      let isSpriteOffScreen = true;
      // todo sprites??
      // if (actor.currentDrawing != null) {
      //     isSpriteOffScreen = this.cullingBox.isSpriteOffScreen(actor, this.engine);
      // }

      let actorBoundsOffscreen = false;
      if (this.engine && this.engine.currentScene && this.engine.currentScene.camera && this.engine.currentScene.camera.viewport) {
        actorBoundsOffscreen = !this.engine.currentScene.camera.viewport.interesects(bounds.box);
      }

      if (!offscreen.offscreen) {
        if (actorBoundsOffscreen && isSpriteOffScreen) {
          events.emit('exitviewport', new ExitViewPortEvent(entity));
          offscreen.offscreen = true;
        }
      } else {
        if (!actorBoundsOffscreen || !isSpriteOffScreen) {
          events.emit('enterviewport', new EnterViewPortEvent(entity));
          offscreen.offscreen = false;
        }
      }
    }
  }
}
