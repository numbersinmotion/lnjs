import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';

export class BoxShape implements IShape {
  Min: Vector;
  Max: Vector;
  Box: Box;

  constructor(Min: Vector, Max: Vector) {
    this.Min = Min;
    this.Max = Max;
    this.Box = new Box(this.Min, this.Max);
  }

  Compile(): void {}

  BoundingBox(): Box {
    return this.Box;
  }

  Contains(v: Vector, f: number): boolean {
    if (v.X < this.Min.X - f || v.X > this.Max.X + f) {
      return false;
    }
    if (v.Y < this.Min.Y - f || v.Y > this.Max.Y + f) {
      return false;
    }
    return !(v.Z < this.Min.Z - f || v.Z > this.Max.Z + f);
  }

  Intersect(r: Ray): Hit {
    let n = this.Min.Sub(r.Origin).Div(r.Direction);
    let f = this.Max.Sub(r.Origin).Div(r.Direction);
    [n, f] = [n.Min(f), n.Max(f)];
    const t0 = Math.max(n.X, n.Y, n.Z);
    const t1 = Math.min(f.X, f.Y, f.Z);
    if (t0 < 1e-3 && t1 > 1e-3) {
      return new Hit(this, t1);
    }
    if (t0 >= 1e-3 && t0 < t1) {
      return new Hit(this, t0);
    }
    return Hit.NoHit();
  }

  Paths(): Paths {
    const [x1, y1, z1] = [this.Min.X, this.Min.Y, this.Min.Z];
    const [x2, y2, z2] = [this.Max.X, this.Max.Y, this.Max.Z];
    return Paths.FromVectors([
      [new Vector(x1, y1, z1), new Vector(x1, y1, z2)],
      [new Vector(x1, y1, z1), new Vector(x1, y2, z1)],
      [new Vector(x1, y1, z1), new Vector(x2, y1, z1)],
      [new Vector(x1, y1, z2), new Vector(x1, y2, z2)],
      [new Vector(x1, y1, z2), new Vector(x2, y1, z2)],
      [new Vector(x1, y2, z1), new Vector(x1, y2, z2)],
      [new Vector(x1, y2, z1), new Vector(x2, y2, z1)],
      [new Vector(x1, y2, z2), new Vector(x2, y2, z2)],
      [new Vector(x2, y1, z1), new Vector(x2, y1, z2)],
      [new Vector(x2, y1, z1), new Vector(x2, y2, z1)],
      [new Vector(x2, y1, z2), new Vector(x2, y2, z2)],
      [new Vector(x2, y2, z1), new Vector(x2, y2, z2)],
    ]);
  }
}
