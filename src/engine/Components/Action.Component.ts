import { Component } from './Component';
import { Actor } from '../Actor';
import { ActionQueue } from '../Actions/Action';
import { ActionContext } from '../Actions/ActionContext';
import { Engine } from '../Engine';

export class ActionComponent implements Component {
  actionQueue: ActionQueue;
  actions: ActionContext;

  init(actor: Actor): void {
    // Build the action queue
    // odd coupling between action queue and action context...
    this.actionQueue = new ActionQueue(actor);
    this.actions = new ActionContext(actor);
  }

  update(actor: Actor, engine: Engine, delta: number): void {
    this.actionQueue.update(delta);
  }

  draw(actor: import('..').Actor, ctx: CanvasRenderingContext2D, delta: number): void {
    // pass
  }
}
