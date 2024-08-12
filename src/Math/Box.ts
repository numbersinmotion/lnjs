import { Vector } from './Vector';
import { Ray } from './Ray';
import { Axis } from './Axis';
import { IShape } from '../Shapes/IShape';
import { TriangleShape } from '../Shapes/TriangleShape';

export class Box {
  Min: Vector;
  Max: Vector;

  constructor(Min: Vector, Max: Vector) {
    this.Min = Min;
    this.Max = Max;
  }

  static BoxForTriangles(triangles: TriangleShape[]): Box {
    if (triangles.length === 0) {
      return new Box(new Vector(0, 0, 0), new Vector(0, 0, 0));
    }
    let box = triangles[0].BoundingBox();
    for (let i = 1; i < triangles.length; i++) {
      box = box.Extend(triangles[i].BoundingBox());
    }
    return box;
  }

  static BoxForShapes(shapes: IShape[]): Box {
    if (shapes.length === 0) {
      return new Box(new Vector(0, 0, 0), new Vector(0, 0, 0));
    }
    let box = shapes[0].BoundingBox();
    for (const shape of shapes) {
      box = box.Extend(shape.BoundingBox());
    }
    return box;
  }

  static BoxForVectors(vectors: Vector[]): Box {
    if (vectors.length === 0) {
      return new Box(new Vector(0, 0, 0), new Vector(0, 0, 0));
    }
    let min = vectors[0];
    let max = vectors[0];
    for (const v of vectors) {
      min = min.Min(v);
      max = max.Max(v);
    }
    return new Box(min, max);
  }

  Anchor(anchor: Vector): Vector {
    return this.Min.Add(this.Size().Mul(anchor));
  }

  Center(): Vector {
    return this.Anchor(new Vector(0.5, 0.5, 0.5));
  }

  Size(): Vector {
    return this.Max.Sub(this.Min);
  }

  Contains(b: Vector): boolean {
    return (
      this.Min.X <= b.X &&
      this.Max.X >= b.X &&
      this.Min.Y <= b.Y &&
      this.Max.Y >= b.Y &&
      this.Min.Z <= b.Z &&
      this.Max.Z >= b.Z
    );
  }

  Extend(b: Box): Box {
    return new Box(this.Min.Min(b.Min), this.Max.Max(b.Max));
  }

  Intersect(r: Ray): [number, number] {
    let x1 = (this.Min.X - r.Origin.X) / r.Direction.X;
    let y1 = (this.Min.Y - r.Origin.Y) / r.Direction.Y;
    let z1 = (this.Min.Z - r.Origin.Z) / r.Direction.Z;
    let x2 = (this.Max.X - r.Origin.X) / r.Direction.X;
    let y2 = (this.Max.Y - r.Origin.Y) / r.Direction.Y;
    let z2 = (this.Max.Z - r.Origin.Z) / r.Direction.Z;
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }
    if (z1 > z2) {
      [z1, z2] = [z2, z1];
    }
    return [Math.max(Math.max(x1, y1), z1), Math.min(Math.min(x2, y2), z2)];
  }

  Partition(axis: Axis, point: number): [boolean, boolean] {
    let [left, right] = [false, false];
    switch (axis) {
      case Axis.AxisX:
        left = this.Min.X <= point;
        right = this.Max.X >= point;
        break;
      case Axis.AxisY:
        left = this.Min.Y <= point;
        right = this.Max.Y >= point;
        break;
      case Axis.AxisZ:
        left = this.Min.Z <= point;
        right = this.Max.Z >= point;
        break;
    }
    return [left, right];
  }
}
