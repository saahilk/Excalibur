import { TransformComponent } from './Transform.Component';
import { PhysicsComponent } from './Physics.Component';
import { OffscreenComponent } from './OffscreenComponent';

export enum ComponentTypes {
  Physics = 'physics',
  Drawing = 'drawing',
  Transform = 'motion',
  Bounds = 'bounds',
  Offscreen = 'offscreen'
}

export type Type = string | ComponentTypes;

export interface Component {
  readonly type: string;
  clone(): Component;
}

export type BuiltInComponents = TransformComponent | PhysicsComponent | OffscreenComponent;
