import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { Path } from '../Math/Path';
import { Radians } from '../Math/Util';

export enum FunctionShapeDirection {
  Above = 0,
  Below = 1,
}

export class FunctionShape implements IShape {
  Function: (x: number, y: number) => number;
  Box: Box;
  Direction: FunctionShapeDirection;

  constructor(
    Function: (x: number, y: number) => number,
    Box: Box,
    Direction: FunctionShapeDirection,
  ) {
    this.Function = Function;
    this.Box = Box;
    this.Direction = Direction;
  }

  static Above(Function: (x: number, y: number) => number, Box: Box): FunctionShape {
    return new FunctionShape(Function, Box, FunctionShapeDirection.Above);
  }

  static Below(Function: (x: number, y: number) => number, Box: Box): FunctionShape {
    return new FunctionShape(Function, Box, FunctionShapeDirection.Below);
  }

  Compile(): void {}

  BoundingBox(): Box {
    return this.Box;
  }

  Contains(v: Vector, f: number): boolean {
    if (this.Direction === FunctionShapeDirection.Below) {
      return v.Z < this.Function(v.X, v.Y);
    } else {
      return v.Z > this.Function(v.X, v.Y);
    }
  }

  Intersect(r: Ray): Hit {
    let step = 1.0 / 64;
    const sign = this.Contains(r.Position(step), 0);
    for (let t = step; t < 10; t += step) {
      const v = r.Position(t);
      if (this.Contains(v, 0) != sign && this.Box.Contains(v)) {
        return new Hit(this, t);
      }
    }
    return Hit.NoHit();
  }

  Paths(): Paths {
    const paths = new Paths();
    const fine = 1.0 / 256;
    for (let a = 0; a < 360; a += 5) {
      const path = new Path();
      for (let r = 0.0; r <= 8.0; r += fine) {
        const x = Math.cos(Radians(a)) * r;
        const y = Math.sin(Radians(a)) * r;
        const z = this.Function(x, y);
        const o = -Math.pow(-z, 1.4);
        path.push(
          new Vector(
            Math.cos(Radians(a) - o) * r,
            Math.sin(Radians(a) - o) * r,
            Math.max(Math.min(z, this.Box.Max.Z), this.Box.Min.Z),
          ),
        );
      }
      paths.push(path);
    }
    return paths;
  }
}
