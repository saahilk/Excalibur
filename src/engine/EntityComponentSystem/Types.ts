import { DrawingComponent } from './DrawingComponent';
import { Component } from './component';
import { TransformComponent } from './TransformComponent';

export type Type = string | ComponentTypes;

// Enum contianing the builtin component types
export enum ComponentTypes {
  Transform = 'Transform',
  Drawing = 'Drawing',
  Body = 'Body',
  Input = 'Input',
  Events = 'Events',
  Actions = 'Actions',
  Texture = 'Texture'
}

export function isDrawing(x: Components): x is DrawingComponent {
  return !!x && x.type === ComponentTypes.Drawing;
}
// Type containing all possible components
export type Components = TransformComponent | DrawingComponent | Component;
