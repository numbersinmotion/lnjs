import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { Tree } from '../Math/Tree';
import { TriangleShape } from './TriangleShape';
import { Matrix } from '../Math/Matrix';

export class MeshShape implements IShape {
  Triangles: TriangleShape[];
  Box: Box;
  Tree?: Tree;

  constructor(Triangles: TriangleShape[]) {
    this.Triangles = Triangles;
    this.Box = Box.BoxForTriangles(Triangles);
  }

  static FromObjString(objString: string): MeshShape {
    const vs: Vector[] = [];
    const triangles: TriangleShape[] = [];
    for (const line of objString.split('\n')) {
      const fields = line.trim().split(' ');
      if (fields.length < 2) {
        continue;
      }
      const keyword = fields[0];
      switch (keyword) {
        case 'v':
          vs.push(
            new Vector(
              parseFloat(fields[1]),
              parseFloat(fields[2]),
              parseFloat(fields[3]),
            ),
          );
          break;
        case 'f':
          const fvs: number[] = [];
          for (let i = 1; i < fields.length; i++) {
            fvs.push(parseInt(fields[i].split('/')[0]));
          }
          for (let i = 1; i < fvs.length - 1; i++) {
            console.log(fvs[0] - 1, fvs[i] - 1, fvs[i + 1] - 1);
            triangles.push(
              new TriangleShape(vs[fvs[0] - 1], vs[fvs[i] - 1], vs[fvs[i + 1] - 1]),
            );
          }
          break;
      }
    }
    return new MeshShape(triangles);
  }

  Compile(): void {
    if (this.Tree === undefined) {
      this.Tree = new Tree(this.Triangles);
    }
  }

  BoundingBox(): Box {
    return this.Box;
  }

  Contains(v: Vector, f: number): boolean {
    return false;
  }

  Intersect(r: Ray): Hit {
    return this.Tree ? this.Tree.Intersect(r) : Hit.NoHit();
  }

  Paths(): Paths {
    const result = new Paths();
    for (const t of this.Triangles) {
      result.push(...t.Paths());
    }
    return result;
  }

  UpdateBoundingBox(): void {
    this.Box = Box.BoxForTriangles(this.Triangles);
  }

  UnitCube() {
    this.FitInside(
      new Box(new Vector(0, 0, 0), new Vector(1, 1, 1)),
      new Vector(0, 0, 0),
    );
    this.MoveTo(new Vector(0, 0, 0), new Vector(0.5, 0.5, 0.5));
  }

  MoveTo(position: Vector, anchor: Vector): void {
    this.Transform(Matrix.Translate(position.Sub(this.Box.Anchor(anchor))));
  }

  FitInside(box: Box, anchor: Vector) {
    const scale = box.Size().Div(this.BoundingBox().Size()).MinComponent();
    const extra = box.Size().Sub(this.BoundingBox().Size().MulScalar(scale));
    this.Transform(
      Matrix.Identity()
        .Translate(this.BoundingBox().Min.MulScalar(-1))
        .Scale(new Vector(scale, scale, scale))
        .Translate(box.Min.Add(extra.Mul(anchor))),
    );
  }

  Transform(matrix: Matrix): void {
    for (let i = 0; i < this.Triangles.length; i++) {
      this.Triangles[i].V1 = matrix.MulPosition(this.Triangles[i].V1);
      this.Triangles[i].V2 = matrix.MulPosition(this.Triangles[i].V2);
      this.Triangles[i].V3 = matrix.MulPosition(this.Triangles[i].V3);
      this.Triangles[i].UpdateBoundingBox();
    }
    this.UpdateBoundingBox();
    this.Tree = undefined;
  }
}
