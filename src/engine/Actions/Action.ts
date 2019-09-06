import { RotationType } from './RotationType';

import { Vector } from '../Algebra';
import { Logger } from '../Util/Log';
import * as Util from '../Util/Util';
import { Entity, BuiltinComponentType, TransformComponent, DrawingComponent } from '../EntityComponentSystem';
import { ActionComponent } from '../EntityComponentSystem/ActionComponent';

/**
 * Used for implementing actions for the [[ActionContext|Action API]].
 */
export interface Action {
  update(delta: number): void;
  isComplete(entity: Entity): boolean;
  reset(): void;
  stop(): void;
}

export class EaseTo implements Action {
  private _currentLerpTime: number = 0;
  private _lerpDuration: number = 1 * 1000; // 1 second
  private _lerpStart: Vector = new Vector(0, 0);
  private _lerpEnd: Vector = new Vector(0, 0);
  private _initialized: boolean = false;
  private _stopped: boolean = false;
  private _distance: number = 0;
  private _transform: TransformComponent;
  constructor(
    public actor: Entity,
    x: number,
    y: number,
    duration: number,
    public easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number
  ) {
    this._lerpDuration = duration;
    this._lerpEnd = new Vector(x, y);
  }
  private _initialize() {
    this._transform = this.actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._lerpStart = new Vector(this._transform.pos.x, this._transform.pos.y);
    this._currentLerpTime = 0;
    this._distance = this._lerpStart.distance(this._lerpEnd);
  }

  public update(delta: number): void {
    if (!this._initialized) {
      this._initialize();
      this._initialized = true;
    }

    let newX = this._transform.pos.x;
    let newY = this._transform.pos.y;
    if (this._currentLerpTime < this._lerpDuration) {
      if (this._lerpEnd.x < this._lerpStart.x) {
        newX =
          this._lerpStart.x -
          (this.easingFcn(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
      } else {
        newX = this.easingFcn(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
      }

      if (this._lerpEnd.y < this._lerpStart.y) {
        newY =
          this._lerpStart.y -
          (this.easingFcn(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
      } else {
        newY = this.easingFcn(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
      }
      this._transform.pos.x = newX;
      this._transform.pos.y = newY;

      this._currentLerpTime += delta;
    } else {
      this._transform.pos.x = this._lerpEnd.x;
      this._transform.pos.y = this._lerpEnd.y;
      //this._lerpStart = null;
      //this._lerpEnd = null;
      //this._currentLerpTime = 0;
    }
  }
  public isComplete(actor: Entity): boolean {
    const transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    return this._stopped || new Vector(transform.pos.x, transform.pos.y).distance(this._lerpStart) >= this._distance;
  }

  public reset(): void {
    this._initialized = false;
  }
  public stop(): void {
    this._stopped = true;
  }
}

export class MoveTo implements Action {
  private _actor: Entity;
  private _transform: TransformComponent;
  public x: number;
  public y: number;
  private _start: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _speed: number;
  private _distance: number;
  private _started = false;
  private _stopped = false;
  constructor(actor: Entity, destx: number, desty: number, speed: number) {
    this._actor = actor;
    this._end = new Vector(destx, desty);
    this._speed = speed;
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._start = new Vector(this._transform.pos.x, this._transform.pos.y);
      this._distance = this._start.distance(this._end);
      this._dir = this._end.sub(this._start).normalize();
    }
    const m = this._dir.scale(this._speed);
    this._transform.vel.x = m.x;
    this._transform.vel.y = m.y;

    if (this.isComplete(this._actor)) {
      this._transform.pos.x = this._end.x;
      this._transform.pos.y = this._end.y;
      this._transform.vel.y = 0;
      this._transform.vel.x = 0;
    }
  }

  public isComplete(actor: Entity): boolean {
    const transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    return this._stopped || new Vector(transform.pos.x, transform.pos.y).distance(this._start) >= this._distance;
  }

  public stop(): void {
    this._transform.vel.y = 0;
    this._transform.vel.x = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}

export class MoveBy implements Action {
  private _actor: Entity;
  private _transform: TransformComponent;
  public x: number;
  public y: number;
  private _distance: number;
  private _speed: number;

  private _start: Vector;
  private _offset: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _started = false;
  private _stopped = false;

  constructor(actor: Entity, offsetX: number, offsetY: number, speed: number) {
    this._actor = actor;
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._speed = speed;
    this._offset = new Vector(offsetX, offsetY);
    if (speed <= 0) {
      Logger.getInstance().error('Attempted to moveBy with speed less than or equal to zero : ' + speed);
      throw new Error('Speed must be greater than 0 pixels per second');
    }
  }

  public update(_delta: number) {
    if (!this._started) {
      this._started = true;
      this._start = new Vector(this._transform.pos.x, this._transform.pos.y);
      this._end = this._start.add(this._offset);
      this._distance = this._offset.magnitude();
      this._dir = this._end.sub(this._start).normalize();
    }

    this._transform.vel = this._dir.scale(this._speed);

    if (this.isComplete(this._actor)) {
      this._transform.pos.x = this._end.x;
      this._transform.pos.y = this._end.y;
      this._transform.vel.y = 0;
      this._transform.vel.x = 0;
    }
  }

  public isComplete(actor: Entity): boolean {
    const transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    return this._stopped || transform.pos.distance(this._start) >= this._distance;
  }

  public stop(): void {
    this._transform.vel.y = 0;
    this._transform.vel.x = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}

export class Follow implements Action {
  private _transform: TransformComponent;
  private _transformToFollow: TransformComponent;
  public x: number;
  public y: number;
  private _current: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _speed: number;
  private _maximumDistance: number;
  private _distanceBetween: number;
  private _started = false;
  private _stopped = false;

  constructor(actor: Entity, actorToFollow: Entity, followDistance?: number) {
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._transformToFollow = actorToFollow.components[BuiltinComponentType.Transform] as TransformComponent;
    this._current = new Vector(this._transform.pos.x, this._transform.pos.y);
    this._end = new Vector(this._transformToFollow.pos.x, this._transformToFollow.pos.y);
    this._maximumDistance = followDistance !== undefined ? followDistance : this._current.distance(this._end);
    this._speed = 0;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._distanceBetween = this._current.distance(this._end);
      this._dir = this._end.sub(this._current).normalize();
    }

    const actorToFollowSpeed = Math.sqrt(Math.pow(this._transformToFollow.vel.x, 2) + Math.pow(this._transformToFollow.vel.y, 2));
    if (actorToFollowSpeed !== 0) {
      this._speed = actorToFollowSpeed;
    }
    this._current.x = this._transform.pos.x;
    this._current.y = this._transform.pos.y;

    this._end.x = this._transformToFollow.pos.x;
    this._end.y = this._transformToFollow.pos.y;
    this._distanceBetween = this._current.distance(this._end);
    this._dir = this._end.sub(this._current).normalize();

    if (this._distanceBetween >= this._maximumDistance) {
      const m = this._dir.scale(this._speed);
      this._transform.vel.x = m.x;
      this._transform.vel.y = m.y;
    } else {
      this._transform.vel.x = 0;
      this._transform.vel.y = 0;
    }

    if (this.isComplete()) {
      this._transform.pos.x = this._end.x;
      this._transform.pos.y = this._end.y;
      this._transform.vel.y = 0;
      this._transform.vel.x = 0;
    }
  }

  public stop(): void {
    this._transform.vel.y = 0;
    this._transform.vel.x = 0;
    this._stopped = true;
  }

  public isComplete(): boolean {
    // the actor following should never stop unless specified to do so
    return this._stopped;
  }

  public reset(): void {
    this._started = false;
  }
}

export class Meet implements Action {
  private _transform: TransformComponent;
  private _transformToMeet: TransformComponent;
  public x: number;
  public y: number;
  private _current: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _speed: number;
  private _distanceBetween: number;
  private _started = false;
  private _stopped = false;
  private _speedWasSpecified = false;

  constructor(actor: Entity, actorToMeet: Entity, speed?: number) {
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._transformToMeet = actorToMeet.components[BuiltinComponentType.Transform] as TransformComponent;
    this._current = new Vector(this._transform.pos.x, this._transform.pos.y);
    this._end = new Vector(this._transformToMeet.pos.x, this._transformToMeet.pos.y);
    this._speed = speed || 0;

    if (speed !== undefined) {
      this._speedWasSpecified = true;
    }
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._distanceBetween = this._current.distance(this._end);
      this._dir = this._end.sub(this._current).normalize();
    }

    const actorToMeetSpeed = Math.sqrt(Math.pow(this._transformToMeet.vel.x, 2) + Math.pow(this._transformToMeet.vel.y, 2));
    if (actorToMeetSpeed !== 0 && !this._speedWasSpecified) {
      this._speed = actorToMeetSpeed;
    }
    this._current.x = this._transform.pos.x;
    this._current.y = this._transform.pos.y;

    this._end.x = this._transformToMeet.pos.x;
    this._end.y = this._transformToMeet.pos.y;
    this._distanceBetween = this._current.distance(this._end);
    this._dir = this._end.sub(this._current).normalize();

    const m = this._dir.scale(this._speed);
    this._transform.vel.x = m.x;
    this._transform.vel.y = m.y;

    if (this.isComplete()) {
      this._transform.pos.x = this._end.x;
      this._transform.pos.y = this._end.y;
      this._transform.vel.y = 0;
      this._transform.vel.x = 0;
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._distanceBetween <= 1;
  }

  public stop(): void {
    this._transform.vel.y = 0;
    this._transform.vel.x = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}

export class RotateTo implements Action {
  private _transform: TransformComponent;
  public x: number;
  public y: number;
  private _start: number;
  private _end: number;
  private _speed: number;
  private _rotationType: RotationType;
  private _direction: number;
  private _distance: number;
  private _shortDistance: number;
  private _longDistance: number;
  private _shortestPathIsPositive: boolean;
  private _started = false;
  private _stopped = false;
  constructor(actor: Entity, angleRadians: number, speed: number, rotationType?: RotationType) {
    this._end = angleRadians;
    this._speed = speed;
    this._rotationType = rotationType || RotationType.ShortestPath;
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._start = this._transform.rotation;
      const distance1 = Math.abs(this._end - this._start);
      const distance2 = Util.TwoPI - distance1;
      if (distance1 > distance2) {
        this._shortDistance = distance2;
        this._longDistance = distance1;
      } else {
        this._shortDistance = distance1;
        this._longDistance = distance2;
      }

      this._shortestPathIsPositive = (this._start - this._end + Util.TwoPI) % Util.TwoPI >= Math.PI;

      switch (this._rotationType) {
        case RotationType.ShortestPath:
          this._distance = this._shortDistance;
          if (this._shortestPathIsPositive) {
            this._direction = 1;
          } else {
            this._direction = -1;
          }
          break;
        case RotationType.LongestPath:
          this._distance = this._longDistance;
          if (this._shortestPathIsPositive) {
            this._direction = -1;
          } else {
            this._direction = 1;
          }
          break;
        case RotationType.Clockwise:
          this._direction = 1;
          if (this._shortestPathIsPositive) {
            this._distance = this._shortDistance;
          } else {
            this._distance = this._longDistance;
          }
          break;
        case RotationType.CounterClockwise:
          this._direction = -1;
          if (!this._shortestPathIsPositive) {
            this._distance = this._shortDistance;
          } else {
            this._distance = this._longDistance;
          }
          break;
      }
    }

    this._transform.angularVelocity = this._direction * this._speed;

    if (this.isComplete()) {
      this._transform.rotation = this._end;
      this._transform.angularVelocity = 0;
      this._stopped = true;
    }
  }

  public isComplete(): boolean {
    const distanceTravelled = Math.abs(this._transform.rotation - this._start);
    return this._stopped || distanceTravelled >= Math.abs(this._distance);
  }

  public stop(): void {
    this._transform.angularVelocity = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}

export class RotateBy implements Action {
  private _transform: TransformComponent;
  public x: number;
  public y: number;
  private _start: number;
  private _end: number;
  private _speed: number;
  private _offset: number;

  private _rotationType: RotationType;
  private _direction: number;
  private _distance: number;
  private _shortDistance: number;
  private _longDistance: number;
  private _shortestPathIsPositive: boolean;
  private _started = false;
  private _stopped = false;
  constructor(actor: Entity, angleRadiansOffset: number, speed: number, rotationType?: RotationType) {
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._speed = speed;
    this._offset = angleRadiansOffset;
    this._rotationType = rotationType || RotationType.ShortestPath;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._start = this._transform.rotation;
      this._end = this._start + this._offset;

      const distance1 = Math.abs(this._end - this._start);
      const distance2 = Util.TwoPI - distance1;
      if (distance1 > distance2) {
        this._shortDistance = distance2;
        this._longDistance = distance1;
      } else {
        this._shortDistance = distance1;
        this._longDistance = distance2;
      }

      this._shortestPathIsPositive = (this._start - this._end + Util.TwoPI) % Util.TwoPI >= Math.PI;

      switch (this._rotationType) {
        case RotationType.ShortestPath:
          this._distance = this._shortDistance;
          if (this._shortestPathIsPositive) {
            this._direction = 1;
          } else {
            this._direction = -1;
          }
          break;
        case RotationType.LongestPath:
          this._distance = this._longDistance;
          if (this._shortestPathIsPositive) {
            this._direction = -1;
          } else {
            this._direction = 1;
          }
          break;
        case RotationType.Clockwise:
          this._direction = 1;
          if (this._shortDistance >= 0) {
            this._distance = this._shortDistance;
          } else {
            this._distance = this._longDistance;
          }
          break;
        case RotationType.CounterClockwise:
          this._direction = -1;
          if (this._shortDistance <= 0) {
            this._distance = this._shortDistance;
          } else {
            this._distance = this._longDistance;
          }
          break;
      }
    }

    this._transform.angularVelocity = this._direction * this._speed;

    if (this.isComplete()) {
      this._transform.rotation = this._end;
      this._transform.angularVelocity = 0;
      this._stopped = true;
    }
  }

  public isComplete(): boolean {
    const distanceTravelled = Math.abs(this._transform.rotation - this._start);
    return this._stopped || distanceTravelled >= Math.abs(this._distance);
  }

  public stop(): void {
    this._transform.angularVelocity = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}

export class Delay implements Action {
  public x: number;
  public y: number;
  private _transform: TransformComponent;
  private _elapsedTime: number = 0;
  private _delay: number;
  private _started: boolean = false;
  private _stopped = false;
  constructor(actor: Entity, delay: number) {
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._delay = delay;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;
    }

    this.x = this._transform.pos.x;
    this.y = this._transform.pos.y;

    this._elapsedTime += delta;
  }

  isComplete(): boolean {
    return this._stopped || this._elapsedTime >= this._delay;
  }

  public stop(): void {
    this._stopped = true;
  }

  reset(): void {
    this._elapsedTime = 0;
    this._started = false;
  }
}

export class Blink implements Action {
  private _timeVisible: number = 0;
  private _timeNotVisible: number = 0;
  private _elapsedTime: number = 0;
  private _totalTime: number = 0;
  private _drawing: DrawingComponent;
  private _duration: number;
  private _stopped: boolean = false;
  private _started: boolean = false;
  constructor(actor: Entity, timeVisible: number, timeNotVisible: number, numBlinks: number = 1) {
    this._drawing = actor.components[BuiltinComponentType.Drawing] as DrawingComponent;

    this._timeVisible = timeVisible;
    this._timeNotVisible = timeNotVisible;
    this._duration = (timeVisible + timeNotVisible) * numBlinks;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;
    }

    this._elapsedTime += delta;
    this._totalTime += delta;
    if (this._drawing.visible && this._elapsedTime >= this._timeVisible) {
      this._drawing.visible = false;
      this._elapsedTime = 0;
    }

    if (!this._drawing.visible && this._elapsedTime >= this._timeNotVisible) {
      this._drawing.visible = true;
      this._elapsedTime = 0;
    }

    if (this.isComplete()) {
      this._drawing.visible = true;
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._totalTime >= this._duration;
  }

  public stop(): void {
    this._drawing.visible = true;
    this._stopped = true;
  }

  public reset() {
    this._started = false;
    this._elapsedTime = 0;
    this._totalTime = 0;
  }
}

export class Fade implements Action {
  public x: number;
  public y: number;

  // private _actor: Entity;
  private _drawing: DrawingComponent;
  private _endOpacity: number;
  private _speed: number;
  private _multiplier: number = 1;
  private _started = false;
  private _stopped = false;

  constructor(actor: Entity, endOpacity: number, speed: number) {
    // this._actor = actor;
    this._drawing = actor.components[BuiltinComponentType.Drawing] as DrawingComponent;
    this._endOpacity = endOpacity;
    this._speed = speed;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;

      // determine direction when we start
      const safeOpacity = this._drawing.opacity === null ? 1 : this._drawing.opacity;
      this._drawing.opacity = safeOpacity; // todo this will be a bug if the original opacity wasnt set
      if (this._endOpacity < safeOpacity) {
        this._multiplier = -1;
      } else {
        this._multiplier = 1;
      }
    }

    if (this._speed > 0) {
      this._drawing.opacity += (this._multiplier * (Math.abs(this._drawing.opacity - this._endOpacity) * delta)) / this._speed;
    }

    this._speed -= delta;

    if (this.isComplete()) {
      this._drawing.opacity = this._endOpacity;
    }

    Logger.getInstance().debug('[Action fade] Actor opacity:', this._drawing.opacity);
  }

  public isComplete(): boolean {
    return this._stopped || Math.abs(this._drawing.opacity - this._endOpacity) < 0.05;
  }

  public stop(): void {
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}

export class Die implements Action {
  public x: number;
  public y: number;

  private _actor: Entity;
  private _actions: ActionComponent;
  private _stopped = false;

  constructor(actor: Entity) {
    this._actor = actor;

    this._actions = this._actor.components[BuiltinComponentType.Action] as ActionComponent;
  }

  public update(_delta: number): void {
    this._actions.clearActions();
    this._actor.active = false;
    this._stopped = true;
  }

  public isComplete(): boolean {
    return this._stopped;
  }

  public stop(): void {
    return;
  }

  public reset(): void {
    return;
  }
}

export class CallMethod implements Action {
  public x: number;
  public y: number;
  private _method: () => any = null;
  private _actor: Entity = null;
  private _hasBeenCalled: boolean = false;
  constructor(actor: Entity, method: () => any) {
    this._actor = actor;
    this._method = method;
  }

  public update(_delta: number) {
    this._method.call(this._actor);
    this._hasBeenCalled = true;
  }
  public isComplete() {
    return this._hasBeenCalled;
  }
  public reset() {
    this._hasBeenCalled = false;
  }
  public stop() {
    this._hasBeenCalled = true;
  }
}

export class Repeat implements Action {
  public x: number;
  public y: number;
  private _transform: TransformComponent;
  private _actionQueue: ActionQueue;
  private _repeat: number;
  private _originalRepeat: number;
  private _stopped: boolean = false;
  constructor(actor: Entity, repeat: number, actions: Action[]) {
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._actionQueue = new ActionQueue(actor);
    this._repeat = repeat;
    this._originalRepeat = repeat;

    const len = actions.length;
    for (let i = 0; i < len; i++) {
      actions[i].reset();
      this._actionQueue.add(actions[i]);
    }
  }

  public update(delta: number): void {
    this.x = this._transform.pos.x;
    this.y = this._transform.pos.y;
    if (!this._actionQueue.hasNext()) {
      this._actionQueue.reset();
      this._repeat--;
    }
    this._actionQueue.update(delta);
  }

  public isComplete(): boolean {
    return this._stopped || this._repeat <= 0;
  }

  public stop(): void {
    this._stopped = true;
  }

  public reset(): void {
    this._repeat = this._originalRepeat;
  }
}

export class RepeatForever implements Action {
  public x: number;
  public y: number;
  private _transform: TransformComponent;
  private _actionQueue: ActionQueue;
  private _stopped: boolean = false;
  constructor(actor: Entity, actions: Action[]) {
    this._transform = actor.components[BuiltinComponentType.Transform] as TransformComponent;
    this._actionQueue = new ActionQueue(actor);

    const len = actions.length;
    for (let i = 0; i < len; i++) {
      actions[i].reset();
      this._actionQueue.add(actions[i]);
    }
  }

  public update(delta: number): void {
    this.x = this._transform.pos.x;
    this.y = this._transform.pos.y;
    if (this._stopped) {
      return;
    }

    if (!this._actionQueue.hasNext()) {
      this._actionQueue.reset();
    }

    this._actionQueue.update(delta);
  }

  public isComplete(): boolean {
    return this._stopped;
  }

  public stop(): void {
    this._stopped = true;
    this._actionQueue.clearActions();
  }

  public reset(): void {
    return;
  }
}

/**
 * Action Queues
 *
 * Action queues are part of the [[ActionContext|Action API]] and
 * store the list of actions to be executed for an [[Actor]].
 *
 * Actors implement [[Actor.actions]] which can be manipulated by
 * advanced users to adjust the actions currently being executed in the
 * queue.
 */
export class ActionQueue {
  private _entity: Entity;
  private _actions: Action[] = [];
  private _currentAction: Action;
  private _completedActions: Action[] = [];
  constructor(entity: Entity) {
    this._entity = entity;
  }

  public add(action: Action) {
    this._actions.push(action);
  }

  public remove(action: Action) {
    const index = this._actions.indexOf(action);
    this._actions.splice(index, 1);
  }

  public clearActions(): void {
    this._actions.length = 0;
    this._completedActions.length = 0;
    if (this._currentAction) {
      this._currentAction.stop();
    }
  }

  public getActions(): Action[] {
    return this._actions.concat(this._completedActions);
  }

  public hasNext(): boolean {
    return this._actions.length > 0;
  }

  public reset(): void {
    this._actions = this.getActions();

    const len = this._actions.length;
    for (let i = 0; i < len; i++) {
      this._actions[i].reset();
    }
    this._completedActions = [];
  }

  public update(delta: number) {
    if (this._actions.length > 0) {
      this._currentAction = this._actions[0];
      this._currentAction.update(delta);

      if (this._currentAction.isComplete(this._entity)) {
        this._completedActions.push(this._actions.shift());
      }
    }
  }
}
