export type ComponentType = string | BuiltinComponentType;

// Enum contianing the builtin component types
export enum BuiltinComponentType {
  Transform = 'transform',
  Drawing = 'drawing',
  Offscreen = 'offscreen',
  Body = 'body',
  Debug = 'debug'
}
