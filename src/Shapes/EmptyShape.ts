import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';

export class EmptyShape implements IShape {
  constructor() {}

  Compile(): void {}

  BoundingBox(): Box {
    return new Box(new Vector(0, 0, 0), new Vector(0, 0, 0));
  }

  Contains(v: Vector, f: number): boolean {
    return false;
  }

  Intersect(r: Ray): Hit {
    return Hit.NoHit();
  }

  Paths(): Paths {
    return new Paths();
  }
}
