import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { IFilter } from '../Core/IFilter';

export enum CsgShapeOperation {
  Intersection = 0,
  Difference = 1,
  Union = 2,
}

export class CsgShapeFilter implements IFilter {
  CsgShape: CsgShape;

  constructor(CsgShape: CsgShape) {
    this.CsgShape = CsgShape;
  }

  Filter(v: Vector): [Vector, boolean] {
    return [v, this.CsgShape.Contains(v, 0)];
  }
}

export class CsgShape implements IShape {
  ShapeA: IShape;
  ShapeB: IShape;
  Operation: CsgShapeOperation;

  constructor(ShapeA: IShape, ShapeB: IShape, Operation: CsgShapeOperation) {
    this.ShapeA = ShapeA;
    this.ShapeB = ShapeB;
    this.Operation = Operation;
  }

  static Intersection(ShapeA: IShape, ShapeB: IShape) {
    return new CsgShape(ShapeA, ShapeB, CsgShapeOperation.Intersection);
  }

  static Difference(ShapeA: IShape, ShapeB: IShape) {
    return new CsgShape(ShapeA, ShapeB, CsgShapeOperation.Difference);
  }

  static Union(ShapeA: IShape, ShapeB: IShape) {
    return new CsgShape(ShapeA, ShapeB, CsgShapeOperation.Union);
  }

  Compile(): void {}

  BoundingBox(): Box {
    // TODO: fix this
    const a = this.ShapeA.BoundingBox();
    const b = this.ShapeB.BoundingBox();
    switch (this.Operation) {
      case CsgShapeOperation.Intersection:
        return new Box(a.Min.Max(b.Min), a.Max.Min(b.Max));
      case CsgShapeOperation.Difference:
        return a;
      case CsgShapeOperation.Union:
        return a.Extend(b);
    }
  }

  Contains(v: Vector, f: number): boolean {
    f = 1e-3;
    switch (this.Operation) {
      case CsgShapeOperation.Intersection:
        return this.ShapeA.Contains(v, f) && this.ShapeB.Contains(v, f);
      case CsgShapeOperation.Difference:
        return this.ShapeA.Contains(v, f) && !this.ShapeB.Contains(v, -f);
      case CsgShapeOperation.Union:
        return this.ShapeA.Contains(v, f) || this.ShapeB.Contains(v, f);
    }
    return false;
  }

  Intersect(r: Ray): Hit {
    const h1 = this.ShapeA.Intersect(r);
    const h2 = this.ShapeB.Intersect(r);
    const h = h1.Min(h2);
    const v = r.Position(h.T);
    if (!h.Ok() || this.Contains(v, 0)) {
      return h;
    }
    return this.Intersect(new Ray(r.Position(h.T + 0.01), r.Direction));
  }

  Paths(): Paths {
    const paths = this.ShapeA.Paths();
    paths.push(...this.ShapeB.Paths());
    return paths.Chop(0.01).Filter(new CsgShapeFilter(this));
  }
}
