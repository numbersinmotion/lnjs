import { Vector } from './Vector';

export class Ray {
  Origin: Vector;
  Direction: Vector;

  constructor(Origin: Vector, Direction: Vector) {
    this.Origin = Origin;
    this.Direction = Direction;
  }

  Position(t: number): Vector {
    return this.Origin.Add(this.Direction.MulScalar(t));
  }
}
