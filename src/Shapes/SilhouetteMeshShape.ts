import { IShape } from './IShape';
import { Box } from '../Math/Box';
import { Vector } from '../Math/Vector';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Paths } from '../Math/Paths';
import { Tree } from '../Math/Tree';
import { TriangleShape } from './TriangleShape';
import { Matrix } from '../Math/Matrix';
import { Path } from '../Math/Path';

export class SilhouetteMeshShape implements IShape {
  Triangles: TriangleShape[];
  Edges: {
    [id: string]: {
      t1Index: number;
      t2Index: number;
      t1VIndex: number;
    };
  };
  SilhouetteEpsilon: number;
  Eye: Vector;
  Box: Box;
  Tree?: Tree;

  constructor(
    Triangles: TriangleShape[],
    Edges: {
      [id: string]: {
        t1Index: number;
        t2Index: number;
        t1VIndex: number;
      };
    },
    Eye: Vector,
    SilhouetteEpsilon: number,
  ) {
    this.Triangles = Triangles;
    this.Edges = Edges;
    this.Eye = Eye;
    this.Box = Box.BoxForTriangles(Triangles);
    this.SilhouetteEpsilon = SilhouetteEpsilon;
  }

  static FromMesh(
    vertices: Vector[],
    faces: { i1: number; i2: number; i3: number }[],
    eye: Vector,
    silhouetteEpsilon: number,
  ): SilhouetteMeshShape {
    const triangles: TriangleShape[] = [];
    const edges: {
      [id: string]: {
        t1Index: number;
        t2Index: number;
        t1VIndex: number;
      };
    } = {};

    for (let i = 0; i < faces.length; i++) {
      const indices = [faces[i].i1, faces[i].i2, faces[i].i3];
      triangles.push(
        new TriangleShape(
          vertices[indices[0]],
          vertices[indices[1]],
          vertices[indices[2]],
        ),
      );
      for (let j = 0; j < 3; j++) {
        let [i1, i2] = [indices[j], indices[(j + 1) % 3]];
        if (i2 < i1) {
          [i1, i2] = [i2, i1];
        }
        if (!(`${i1}-${i2}` in edges)) {
          edges[`${i1}-${i2}`] = {
            t1Index: triangles.length - 1,
            t2Index: -1,
            t1VIndex: j,
          };
        } else {
          edges[`${i1}-${i2}`].t2Index = triangles.length - 1;
        }
      }
    }
    return new SilhouetteMeshShape(triangles, edges, eye, silhouetteEpsilon);
  }

  static FromObjString(
    objString: string,
    eye: Vector,
    SilhouetteEpsilon: number,
  ): SilhouetteMeshShape {
    const vs: Vector[] = [];
    const es: {
      [id: string]: {
        t1Index: number;
        t2Index: number;
        t1VIndex: number;
      };
    } = {};
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
            const indices = [fvs[0] - 1, fvs[i] - 1, fvs[i + 1] - 1];
            const [v1, v2, v3] = [vs[indices[0]], vs[indices[1]], vs[indices[2]]];
            triangles.push(new TriangleShape(v1, v2, v3));
            for (let j = 0; j < 3; j++) {
              let [i1, i2] = [indices[j], indices[(j + 1) % 3]];
              if (i2 < i1) {
                [i1, i2] = [i2, i1];
              }
              if (!(`${i1}-${i2}` in es)) {
                es[`${i1}-${i2}`] = {
                  t1Index: triangles.length - 1,
                  t2Index: -1,
                  t1VIndex: j,
                };
              } else {
                es[`${i1}-${i2}`].t2Index = triangles.length - 1;
              }
            }
          }
          break;
      }
    }
    return new SilhouetteMeshShape(triangles, es, eye, SilhouetteEpsilon);
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
    for (const key of Object.keys(this.Edges)) {
      const nEye = this.Eye.Normalize();
      const eps = this.SilhouetteEpsilon;
      const t1 = this.Triangles[this.Edges[key].t1Index];
      const ps1 = [t1.V1, t1.V2, t1.V3];
      const vi1 = this.Edges[key].t1VIndex;
      const [p1, p2] = [ps1[vi1], ps1[(vi1 + 1) % 3]];
      const n1 = t1.V2.Sub(t1.V1).Cross(t1.V3.Sub(t1.V1)).Normalize();
      const d1 = nEye.Dot(n1);
      if (this.Edges[key].t2Index !== -1) {
        const t2 = this.Triangles[this.Edges[key].t2Index];
        const n2 = t2.V2.Sub(t2.V1).Cross(t2.V3.Sub(t2.V1)).Normalize();
        const d2 = nEye.Dot(n2);
        if ((d1 >= -eps && d2 <= eps) || (d1 <= eps && d2 >= -eps)) {
          result.push(Path.FromVectors([p1, p2]));
        }
      } else {
        result.push(Path.FromVectors([p1, p2]));
      }
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
