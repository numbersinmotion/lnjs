import { IShape } from '../Shapes/IShape';
import { Tree } from '../Math/Tree';
import { Ray } from '../Math/Ray';
import { Hit } from '../Math/Hit';
import { Vector } from '../Math/Vector';
import { Paths } from '../Math/Paths';
import { Matrix } from '../Math/Matrix';
import { ClipFilter } from './ClipFilter';

export class Scene {
  Shapes: IShape[];
  Tree?: Tree;

  constructor() {
    this.Shapes = [];
  }

  Compile(): void {
    for (const shape of this.Shapes) {
      shape.Compile();
    }
    if (this.Tree === undefined) {
      this.Tree = new Tree(this.Shapes);
    }
  }

  Add(shape: IShape): void {
    this.Shapes.push(shape);
  }

  Intersect(r: Ray): Hit {
    if (!this.Tree) {
      return Hit.NoHit();
    }
    return this.Tree.Intersect(r);
  }

  Visible(eye: Vector, point: Vector): boolean {
    const v = eye.Sub(point);
    const r = new Ray(point, v.Normalize());
    const hit = this.Intersect(r);
    return hit.T >= v.Length();
  }

  Paths(): Paths {
    const result = new Paths();
    for (const shape of this.Shapes) {
      result.push(...shape.Paths());
    }
    return result;
  }

  Render(
    eye: Vector,
    center: Vector,
    up: Vector,
    width: number,
    height: number,
    fovy: number,
    near: number,
    far: number,
    step: number,
  ): Paths {
    const matrix = Matrix.LookAt(eye, center, up).Perspective(
      fovy,
      width / height,
      near,
      far,
    );
    return this.RenderWithMatrix(matrix, eye, width, height, step);
  }

  RenderOrthographic(
    eye: Vector,
    center: Vector,
    up: Vector,
    width: number,
    height: number,
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
    step: number,
  ): Paths {
    const matrix = Matrix.LookAt(eye, center, up).Orthographic(
      left,
      right,
      bottom,
      top,
      near,
      far,
    );
    return this.RenderWithMatrix(matrix, eye, width, height, step);
  }

  RenderWithMatrix(
    matrix: Matrix,
    eye: Vector,
    width: number,
    height: number,
    step: number,
  ): Paths {
    this.Compile();
    let paths = this.Paths();
    if (step > 0) {
      paths = paths.Chop(step);
    }
    paths = paths.Filter(new ClipFilter(matrix, eye, this));
    if (step > 0) {
      paths = paths.Simplify(1e-6);
    }
    paths = paths.Transform(
      Matrix.Translate(new Vector(1, -1, 0)).Scale(new Vector(width / 2, -height / 2, 0)),
    );
    return paths;
  }
}
