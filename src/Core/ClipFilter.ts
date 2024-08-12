import { IFilter } from './IFilter';
import { Vector } from '../Math/Vector';
import { Matrix } from '../Math/Matrix';
import { Box } from '../Math/Box';
import { Scene } from './Scene';

export class ClipFilter implements IFilter {
  constructor(
    public Matrix: Matrix,
    public Eye: Vector,
    public Scene: Scene,
  ) {}

  static ClipBox = new Box(new Vector(-1, -1, -1), new Vector(1, 1, 1));

  Filter(v: Vector): [Vector, boolean] {
    const w = this.Matrix.MulPositionW(v);
    if (!this.Scene.Visible(this.Eye, v)) {
      return [w, false];
    }
    if (!ClipFilter.ClipBox.Contains(w)) {
      return [w, false];
    }
    return [w, true];
  }
}
