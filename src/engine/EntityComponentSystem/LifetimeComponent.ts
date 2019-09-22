import { Component } from './Component';
import { BuiltinComponentType } from './ComponentTypes';

export class LifetimeComponent implements Component {
  public readonly type = BuiltinComponentType.Lifetime;
  public static DefaultLiftime = 10; // seconds
  public current: number;

  /**
   *
   * @param lifetime Entity lifetime in seconds
   */
  constructor(public lifetime: number = LifetimeComponent.DefaultLiftime) {
    this.current = lifetime;
  }

  public clone(): LifetimeComponent {
    const newlife = new LifetimeComponent();
    newlife.lifetime = newlife.current = this.lifetime;
    return newlife;
  }
}
