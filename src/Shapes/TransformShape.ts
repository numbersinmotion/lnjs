import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { Matrix } from '../Math/Matrix';

export class TransformShape implements IShape {
  Shape: IShape;
  Matrix: Matrix;
  Inverse: Matrix;

  constructor(Shape: IShape, Matrix: Matrix) {
    this.Shape = Shape;
    this.Matrix = Matrix;
    this.Inverse = this.Matrix.Inverse();
  }

  Compile(): void {
    this.Shape.Compile();
  }

  BoundingBox(): Box {
    return this.Matrix.MulBox(this.Shape.BoundingBox());
  }

  Contains(v: Vector, f: number): boolean {
    return this.Shape.Contains(this.Inverse.MulPosition(v), f);
  }

  Intersect(r: Ray): Hit {
    return this.Shape.Intersect(this.Inverse.MulRay(r));
  }

  Paths(): Paths {
    return this.Shape.Paths().Transform(this.Matrix);
  }
}
