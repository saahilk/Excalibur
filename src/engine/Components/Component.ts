import { TransformComponent } from './Transform.Component';
import { RigidPhysicsComponent } from './Physics.Component';
import { OffscreenComponent } from './OffscreenComponent';

export enum ComponentTypes {
  Physics = 'physics',
  Drawing = 'drawing',
  Transform = 'transform',
  CameraBound = 'camerabound',
  Bounds = 'bounds',
  Offscreen = 'offscreen'
}

export type Type = string | ComponentTypes;

export interface Component {
  readonly type: string;
  clone(): Component;
}

export type BuiltInComponents = TransformComponent | RigidPhysicsComponent | OffscreenComponent;
