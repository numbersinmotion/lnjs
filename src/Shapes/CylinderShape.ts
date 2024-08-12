import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { Path } from '../Math/Path';
import { Radians } from '../Math/Util';

export class CylinderShape implements IShape {
  Radius: number;
  Z0: number;
  Z1: number;
  Box: Box;

  constructor(Radius: number, Z0: number, Z1: number) {
    this.Radius = Radius;
    this.Z0 = Z0;
    this.Z1 = Z1;
    this.Box = new Box(
      new Vector(-this.Radius, -this.Radius, this.Z0),
      new Vector(this.Radius, this.Radius, this.Z1),
    );
  }

  Compile(): void {}

  BoundingBox(): Box {
    return this.Box;
  }

  Contains(v: Vector, f: number): boolean {
    const xy = new Vector(v.X, v.Y, 0);
    if (xy.Length() > this.Radius + f) {
      return false;
    }
    return v.Z >= this.Z0 - f && v.Z <= this.Z1 + f;
  }

  Intersect(ray: Ray): Hit {
    const r = this.Radius;
    const o = ray.Origin;
    const d = ray.Direction;
    const a = d.X * d.X + d.Y * d.Y;
    const b = 2 * o.X * d.X + 2 * o.Y * d.Y;
    const c = o.X * o.X + o.Y * o.Y - r * r;
    const q = b * b - 4 * a * c;
    if (q < 0) {
      return Hit.NoHit();
    }
    const s = Math.sqrt(q);
    let t0 = (-b + s) / (2 * a);
    let t1 = (-b - s) / (2 * a);
    if (t0 > t1) {
      [t0, t1] = [t1, t0];
    }
    const z0 = o.Z + t0 * d.Z;
    const z1 = o.Z + t1 * d.Z;
    if (t0 > 1e-6 && this.Z0 < z0 && z0 < this.Z1) {
      return new Hit(this, t0);
    }
    if (t1 > 1e-6 && this.Z0 < z1 && z1 < this.Z1) {
      return new Hit(this, t1);
    }
    return Hit.NoHit();
  }

  Paths(): Paths {
    const result = new Paths();
    for (let a = 0; a < 360; a += 10) {
      const x = this.Radius * Math.cos(Radians(a));
      const y = this.Radius * Math.sin(Radians(a));
      result.push(
        Path.FromVectors([new Vector(x, y, this.Z0), new Vector(x, y, this.Z1)]),
      );
    }
    return result;
  }
}
