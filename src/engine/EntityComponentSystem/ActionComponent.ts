import { Component } from './Component';
import { ComponentType, BuiltinComponentType } from './ComponentTypes';
import { TransformComponent } from './TransformComponent';
import { ActionContext } from '../Actions/ActionContext';
import { ActionQueue } from '../Actions/Action';
import { Entity } from './Entity';

export class ActionComponent extends ActionContext implements Component {
  public readonly type: ComponentType = BuiltinComponentType.Action;
  public readonly dependencies = [TransformComponent];

  public queue: ActionQueue;
  public onAdd(owner: Entity) {
    this.queue = new ActionQueue(owner);
    this.addActorToContext(owner);
  }

  public clone(): Component {
    return new ActionComponent();
  }
}
