import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { Path } from '../Math/Path';
import { LatLngToXYZ } from '../Math/Util';

export class SphereShape implements IShape {
  Center: Vector;
  Radius: number;
  Box: Box;

  constructor(Center: Vector, Radius: number) {
    this.Center = Center;
    this.Radius = Radius;
    this.Box = new Box(
      new Vector(
        this.Center.X - this.Radius,
        this.Center.Y - this.Radius,
        this.Center.Z - this.Radius,
      ),
      new Vector(
        this.Center.X + this.Radius,
        this.Center.Y + this.Radius,
        this.Center.Z + this.Radius,
      ),
    );
  }

  Compile(): void {}

  BoundingBox(): Box {
    return this.Box;
  }

  Contains(v: Vector, f: number): boolean {
    return v.Sub(this.Center).Length() <= this.Radius + f;
  }

  Intersect(r: Ray): Hit {
    const radius = this.Radius;
    const to = r.Origin.Sub(this.Center);
    const b = to.Dot(r.Direction);
    const c = to.Dot(to) - radius * radius;
    let d = b * b - c;
    if (d > 0) {
      d = Math.sqrt(d);
      const t1 = -b - d;
      if (t1 > 1e-2) {
        return new Hit(this, t1);
      }
      const t2 = -b + d;
      if (t2 > 1e-2) {
        return new Hit(this, t2);
      }
    }
    return Hit.NoHit();
  }

  Paths(): Paths {
    let paths = new Paths();
    const n = 10;
    const o = 10;
    for (let lat = -90 + o; lat <= 90 - o; lat += n) {
      const path = new Path();
      for (let lng = 0; lng <= 360; lng++) {
        path.push(LatLngToXYZ(lat, lng, this.Radius).Add(this.Center));
      }
      paths.push(path);
    }
    for (let lng = 0; lng <= 360; lng += n) {
      const path = new Path();
      for (let lat = -90 + o; lat <= 90 - o; lat++) {
        path.push(LatLngToXYZ(lat, lng, this.Radius).Add(this.Center));
      }
      paths.push(path);
    }
    return paths;
  }
}
