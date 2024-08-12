import { Shapes } from '../Shapes';
import { IShape } from '../Shapes/IShape';

export class Hit {
  Shape: IShape;
  T: number;

  constructor(Shape: IShape, T: number) {
    this.Shape = Shape;
    this.T = T;
  }

  static NoHit(): Hit {
    return new Hit(new Shapes.EmptyShape(), Infinity);
  }

  Ok(): boolean {
    return this.T < Infinity;
  }

  Min(b: Hit): Hit {
    if (this.T <= b.T) {
      return this;
    }
    return b;
  }

  Max(b: Hit): Hit {
    if (this.T > b.T) {
      return this;
    }
    return b;
  }
}
