import { Vector } from '../Math/Vector';

export interface IFilter {
  Filter(v: Vector): [Vector, boolean];
}
