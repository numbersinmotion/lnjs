import { Axis } from './Axis';
import { IShape } from '../Shapes/IShape';
import { Ray } from './Ray';
import { Hit } from './Hit';
import { Median } from './Util';

export class Node {
  Axis: Axis;
  Point: number;
  Shapes: IShape[];
  Left?: Node;
  Right?: Node;

  constructor(shapes: IShape[]) {
    this.Axis = Axis.AxisNone;
    this.Point = 0;
    this.Shapes = shapes;
    this.Left = undefined;
    this.Right = undefined;
  }

  Intersect(r: Ray, tmin: number, tmax: number): Hit {
    let tsplit: number;
    let leftFirst: boolean;

    switch (this.Axis) {
      case Axis.AxisNone:
        return this.IntersectShapes(r);
      case Axis.AxisX:
        tsplit = (this.Point - r.Origin.X) / r.Direction.X;
        leftFirst =
          r.Origin.X < this.Point || (r.Origin.X === this.Point && r.Direction.X <= 0);
        break;
      case Axis.AxisY:
        tsplit = (this.Point - r.Origin.Y) / r.Direction.Y;
        leftFirst =
          r.Origin.Y < this.Point || (r.Origin.Y === this.Point && r.Direction.Y <= 0);
        break;
      case Axis.AxisZ:
        tsplit = (this.Point - r.Origin.Z) / r.Direction.Z;
        leftFirst =
          r.Origin.Z < this.Point || (r.Origin.Z === this.Point && r.Direction.Z <= 0);
        break;
      default:
        throw new Error('Unknown axis');
    }

    const first = leftFirst ? this.Left : this.Right;
    const second = leftFirst ? this.Right : this.Left;

    if (!first || !second) {
      return Hit.NoHit();
    }

    if (tsplit > tmax || tsplit <= 0) {
      return first.Intersect(r, tmin, tmax);
    } else if (tsplit < tmin) {
      return second.Intersect(r, tmin, tmax);
    } else {
      const h1 = first.Intersect(r, tmin, tsplit);
      if (h1.T <= tsplit) {
        return h1;
      }
      const h2 = second.Intersect(r, tsplit, Math.min(tmax, h1.T));
      return h1.T <= h2.T ? h1 : h2;
    }
  }

  IntersectShapes(r: Ray): Hit {
    let hit = Hit.NoHit();
    for (const shape of this.Shapes) {
      const h = shape.Intersect(r);
      if (h.T < hit.T) {
        hit = h;
      }
    }
    return hit;
  }

  PartitionScore(axis: Axis, point: number): number {
    let left = 0,
      right = 0;
    for (const shape of this.Shapes) {
      const box = shape.BoundingBox();
      const [l, r] = box.Partition(axis, point);
      if (l) left++;
      if (r) right++;
    }
    return Math.max(left, right);
  }

  Partition(size: number, axis: Axis, point: number): [IShape[], IShape[]] {
    const left: IShape[] = [];
    const right: IShape[] = [];
    for (const shape of this.Shapes) {
      const box = shape.BoundingBox();
      const [l, r] = box.Partition(axis, point);
      if (l) left.push(shape);
      if (r) right.push(shape);
    }
    return [left, right];
  }

  Split(depth: number): void {
    if (this.Shapes.length < 8) return;

    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[] = [];
    for (const shape of this.Shapes) {
      const box = shape.BoundingBox();
      xs.push(box.Min.X, box.Max.X);
      ys.push(box.Min.Y, box.Max.Y);
      zs.push(box.Min.Z, box.Max.Z);
    }

    xs.sort((a, b) => a - b);
    ys.sort((a, b) => a - b);
    zs.sort((a, b) => a - b);

    const mx = Median(xs);
    const my = Median(ys);
    const mz = Median(zs);

    let best = Math.floor(this.Shapes.length * 0.85);
    let bestAxis = Axis.AxisNone;
    let bestPoint = 0;

    const sx = this.PartitionScore(Axis.AxisX, mx);
    if (sx < best) {
      best = sx;
      bestAxis = Axis.AxisX;
      bestPoint = mx;
    }
    const sy = this.PartitionScore(Axis.AxisY, my);
    if (sy < best) {
      best = sy;
      bestAxis = Axis.AxisY;
      bestPoint = my;
    }
    const sz = this.PartitionScore(Axis.AxisZ, mz);
    if (sz < best) {
      best = sz;
      bestAxis = Axis.AxisZ;
      bestPoint = mz;
    }

    if (bestAxis === Axis.AxisNone) return;

    const [left, right] = this.Partition(best, bestAxis, bestPoint);
    this.Axis = bestAxis;
    this.Point = bestPoint;
    this.Left = new Node(left);
    this.Right = new Node(right);
    this.Left.Split(depth + 1);
    this.Right.Split(depth + 1);
    this.Shapes = []; // only needed at leaf nodes
  }
}
