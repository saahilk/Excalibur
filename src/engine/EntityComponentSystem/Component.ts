import { Type } from './Types';
import { Entity } from './Entity';

export interface Component {
  readonly type: Type;
  owner: Entity;
  clone(): Component;
}
