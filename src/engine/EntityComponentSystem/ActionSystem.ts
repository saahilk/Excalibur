import { System } from './System';
import { BuiltinComponentType, ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { ActionComponent } from './ActionComponent';

export class ActionSystem implements System {
  readonly types: ComponentType[] = [BuiltinComponentType.Action];
  public update(entities: Entity[], delta: number) {
    for (const entity of entities) {
      const actions = entity.components[BuiltinComponentType.Action] as ActionComponent;
      actions.queue.update(delta);
    }
  }
}
