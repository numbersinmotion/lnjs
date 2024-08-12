import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';

export interface IShape {
  Compile(): void;
  BoundingBox(): Box;
  Contains(v: Vector, f: number): boolean;
  Intersect(r: Ray): Hit;
  Paths(): Paths;
}
