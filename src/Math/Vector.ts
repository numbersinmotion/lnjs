export class Vector {
  X: number;
  Y: number;
  Z: number;

  constructor(X: number, Y: number, Z: number) {
    this.X = X;
    this.Y = Y;
    this.Z = Z;
  }

  static RandomUnitVector(): Vector {
    while (true) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      if (x * x + y * y + z * z > 1) continue;
      return new Vector(x, y, z).Normalize();
    }
  }

  Length(): number {
    return Math.sqrt(this.X * this.X + this.Y * this.Y + this.Z * this.Z);
  }

  Distance(b: Vector): number {
    return this.Sub(b).Length();
  }

  LengthSquared(): number {
    return this.X * this.X + this.Y * this.Y + this.Z * this.Z;
  }

  DistanceSquared(b: Vector): number {
    return this.Sub(b).LengthSquared();
  }

  Dot(b: Vector): number {
    return this.X * b.X + this.Y * b.Y + this.Z * b.Z;
  }

  Cross(b: Vector): Vector {
    const x = this.Y * b.Z - this.Z * b.Y;
    const y = this.Z * b.X - this.X * b.Z;
    const z = this.X * b.Y - this.Y * b.X;
    return new Vector(x, y, z);
  }

  Normalize(): Vector {
    const d = this.Length();
    return new Vector(this.X / d, this.Y / d, this.Z / d);
  }

  Add(b: Vector): Vector {
    return new Vector(this.X + b.X, this.Y + b.Y, this.Z + b.Z);
  }

  Sub(b: Vector): Vector {
    return new Vector(this.X - b.X, this.Y - b.Y, this.Z - b.Z);
  }

  Mul(b: Vector): Vector {
    return new Vector(this.X * b.X, this.Y * b.Y, this.Z * b.Z);
  }

  Div(b: Vector): Vector {
    return new Vector(this.X / b.X, this.Y / b.Y, this.Z / b.Z);
  }

  AddScalar(b: number): Vector {
    return new Vector(this.X + b, this.Y + b, this.Z + b);
  }

  SubScalar(b: number): Vector {
    return new Vector(this.X - b, this.Y - b, this.Z - b);
  }

  MulScalar(b: number): Vector {
    return new Vector(this.X * b, this.Y * b, this.Z * b);
  }

  DivScalar(b: number): Vector {
    return new Vector(this.X / b, this.Y / b, this.Z / b);
  }

  Min(b: Vector): Vector {
    return new Vector(
      Math.min(this.X, b.X),
      Math.min(this.Y, b.Y),
      Math.min(this.Z, b.Z),
    );
  }

  Max(b: Vector): Vector {
    return new Vector(
      Math.max(this.X, b.X),
      Math.max(this.Y, b.Y),
      Math.max(this.Z, b.Z),
    );
  }

  MinAxis(): Vector {
    const x = Math.abs(this.X);
    const y = Math.abs(this.Y);
    const z = Math.abs(this.Z);
    if (x <= y && x <= z) {
      return new Vector(1, 0, 0);
    } else if (y <= x && y <= z) {
      return new Vector(0, 1, 0);
    } else {
      return new Vector(0, 0, 1);
    }
  }

  MinComponent(): number {
    return Math.min(Math.min(this.X, this.Y), this.Z);
  }

  SegmentDistance(v: Vector, w: Vector): number {
    const l2 = v.DistanceSquared(w);
    if (l2 === 0) {
      return this.Distance(v);
    }
    let t = this.Sub(v).Dot(w.Sub(v)) / l2;
    if (t < 0) {
      return this.Distance(v);
    }
    if (t > 1) {
      return this.Distance(w);
    }
    return v.Add(w.Sub(v).MulScalar(t)).Distance(this);
  }
}
