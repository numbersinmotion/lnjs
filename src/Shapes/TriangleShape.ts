import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { Path } from '../Math/Path';

export class TriangleShape implements IShape {
  V1: Vector;
  V2: Vector;
  V3: Vector;
  Box: Box;

  constructor(V1: Vector, V2: Vector, V3: Vector) {
    this.V1 = V1;
    this.V2 = V2;
    this.V3 = V3;
    this.Box = new Box(new Vector(0, 0, 0), new Vector(0, 0, 0));
    this.UpdateBoundingBox();
  }

  UpdateBoundingBox() {
    this.Box.Min = this.V1.Min(this.V2).Min(this.V3);
    this.Box.Max = this.V1.Max(this.V2).Max(this.V3);
  }

  Compile(): void {}

  BoundingBox(): Box {
    return this.Box;
  }

  Contains(v: Vector, f: number): boolean {
    return false;
  }

  Intersect(r: Ray): Hit {
    const e1x = this.V2.X - this.V1.X;
    const e1y = this.V2.Y - this.V1.Y;
    const e1z = this.V2.Z - this.V1.Z;
    const e2x = this.V3.X - this.V1.X;
    const e2y = this.V3.Y - this.V1.Y;
    const e2z = this.V3.Z - this.V1.Z;
    const px = r.Direction.Y * e2z - r.Direction.Z * e2y;
    const py = r.Direction.Z * e2x - r.Direction.X * e2z;
    const pz = r.Direction.X * e2y - r.Direction.Y * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (det > -1e-6 && det < 1e-6) {
      return Hit.NoHit();
    }
    const inv = 1 / det;
    const tx = r.Origin.X - this.V1.X;
    const ty = r.Origin.Y - this.V1.Y;
    const tz = r.Origin.Z - this.V1.Z;
    const u = (tx * px + ty * py + tz * pz) * inv;
    if (u < 0 || u > 1) {
      return Hit.NoHit();
    }
    const qx = ty * e1z - tz * e1y;
    const qy = tz * e1x - tx * e1z;
    const qz = tx * e1y - ty * e1x;
    const v = (r.Direction.X * qx + r.Direction.Y * qy + r.Direction.Z * qz) * inv;
    if (v < 0 || u + v > 1) {
      return Hit.NoHit();
    }
    const d = (e2x * qx + e2y * qy + e2z * qz) * inv;
    if (d < 1e-6) {
      return Hit.NoHit();
    }
    return new Hit(this, d);
  }

  Paths(): Paths {
    const result = new Paths();
    result.push(Path.FromVectors([this.V1, this.V2]));
    result.push(Path.FromVectors([this.V2, this.V3]));
    result.push(Path.FromVectors([this.V3, this.V1]));
    return result;
  }
}
