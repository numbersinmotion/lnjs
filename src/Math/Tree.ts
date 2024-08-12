import { Box } from './Box';
import { Node } from './Node';
import { IShape } from '../Shapes/IShape';
import { Hit } from './Hit';
import { Ray } from './Ray';

export class Tree {
  Box: Box;
  Root: Node;

  constructor(shapes: IShape[]) {
    this.Box = Box.BoxForShapes(shapes);
    this.Root = new Node(shapes);
    this.Root.Split(0);
  }

  Intersect(r: Ray): Hit {
    const [tmin, tmax] = this.Box.Intersect(r);
    if (tmax < tmin || tmax <= 0) {
      return Hit.NoHit();
    }
    return this.Root.Intersect(r, tmin, tmax);
  }
}
