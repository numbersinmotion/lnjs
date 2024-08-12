import { Vector } from './Vector';
import { Ray } from './Ray';
import { Box } from './Box';

export class Matrix {
  x00: number;
  x01: number;
  x02: number;
  x03: number;
  x10: number;
  x11: number;
  x12: number;
  x13: number;
  x20: number;
  x21: number;
  x22: number;
  x23: number;
  x30: number;
  x31: number;
  x32: number;
  x33: number;

  constructor(
    x00: number,
    x01: number,
    x02: number,
    x03: number,
    x10: number,
    x11: number,
    x12: number,
    x13: number,
    x20: number,
    x21: number,
    x22: number,
    x23: number,
    x30: number,
    x31: number,
    x32: number,
    x33: number,
  ) {
    this.x00 = x00;
    this.x01 = x01;
    this.x02 = x02;
    this.x03 = x03;
    this.x10 = x10;
    this.x11 = x11;
    this.x12 = x12;
    this.x13 = x13;
    this.x20 = x20;
    this.x21 = x21;
    this.x22 = x22;
    this.x23 = x23;
    this.x30 = x30;
    this.x31 = x31;
    this.x32 = x32;
    this.x33 = x33;
  }

  static Zero(): Matrix {
    return new Matrix(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }

  static Identity(): Matrix {
    return new Matrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  static Translate(v: Vector): Matrix {
    return new Matrix(1, 0, 0, v.X, 0, 1, 0, v.Y, 0, 0, 1, v.Z, 0, 0, 0, 1);
  }

  static Scale(v: Vector): Matrix {
    return new Matrix(v.X, 0, 0, 0, 0, v.Y, 0, 0, 0, 0, v.Z, 0, 0, 0, 0, 1);
  }

  static Rotate(v: Vector, a: number): Matrix {
    const vn = v.Normalize();
    const s = Math.sin(a);
    const c = Math.cos(a);
    const m = 1 - c;
    return new Matrix(
      m * vn.X * vn.X + c,
      m * vn.X * vn.Y + vn.Z * s,
      m * vn.Z * vn.X - vn.Y * s,
      0,
      m * vn.X * vn.Y - vn.Z * s,
      m * vn.Y * vn.Y + c,
      m * vn.Y * vn.Z + vn.X * s,
      0,
      m * vn.Z * vn.X + vn.Y * s,
      m * vn.Y * vn.Z - vn.X * s,
      m * vn.Z * vn.Z + c,
      0,
      0,
      0,
      0,
      1,
    );
  }

  static Frustum(
    l: number,
    r: number,
    b: number,
    t: number,
    n: number,
    f: number,
  ): Matrix {
    const t1 = 2 * n;
    const t2 = r - l;
    const t3 = t - b;
    const t4 = f - n;
    return new Matrix(
      t1 / t2,
      0,
      (r + l) / t2,
      0,
      0,
      t1 / t3,
      (t + b) / t3,
      0,
      0,
      0,
      (-f - n) / t4,
      (-t1 * f) / t4,
      0,
      0,
      -1,
      0,
    );
  }

  static Orthographic(
    l: number,
    r: number,
    b: number,
    t: number,
    n: number,
    f: number,
  ): Matrix {
    return new Matrix(
      2 / (r - l),
      0,
      0,
      -(r + l) / (r - l),
      0,
      2 / (t - b),
      0,
      -(t + b) / (t - b),
      0,
      0,
      -2 / (f - n),
      -(f + n) / (f - n),
      0,
      0,
      0,
      1,
    );
  }

  static Perspective(fovy: number, aspect: number, near: number, far: number): Matrix {
    const ymax = near * Math.tan((fovy * Math.PI) / 360);
    const xmax = ymax * aspect;
    return this.Frustum(-xmax, xmax, -ymax, ymax, near, far);
  }

  static LookAt(eye: Vector, center: Vector, up: Vector): Matrix {
    const f = center.Sub(eye).Normalize();
    const s = f.Cross(up.Normalize()).Normalize();
    const u = s.Cross(f).Normalize();
    const m = new Matrix(
      s.X,
      u.X,
      -f.X,
      eye.X,
      s.Y,
      u.Y,
      -f.Y,
      eye.Y,
      s.Z,
      u.Z,
      -f.Z,
      eye.Z,
      0,
      0,
      0,
      1,
    );
    return m.Inverse();
  }

  Translate(v: Vector): Matrix {
    return Matrix.Translate(v).Mul(this);
  }

  Scale(v: Vector): Matrix {
    return Matrix.Scale(v).Mul(this);
  }

  Rotate(v: Vector, a: number): Matrix {
    return Matrix.Rotate(v, a).Mul(this);
  }

  Frustum(l: number, r: number, b: number, t: number, n: number, f: number): Matrix {
    return Matrix.Frustum(l, r, b, t, n, f).Mul(this);
  }

  Orthographic(l: number, r: number, b: number, t: number, n: number, f: number): Matrix {
    return Matrix.Orthographic(l, r, b, t, n, f).Mul(this);
  }

  Perspective(fovy: number, aspect: number, near: number, far: number): Matrix {
    return Matrix.Perspective(fovy, aspect, near, far).Mul(this);
  }

  Mul(b: Matrix): Matrix {
    const m = Matrix.Identity();
    m.x00 = this.x00 * b.x00 + this.x01 * b.x10 + this.x02 * b.x20 + this.x03 * b.x30;
    m.x10 = this.x10 * b.x00 + this.x11 * b.x10 + this.x12 * b.x20 + this.x13 * b.x30;
    m.x20 = this.x20 * b.x00 + this.x21 * b.x10 + this.x22 * b.x20 + this.x23 * b.x30;
    m.x30 = this.x30 * b.x00 + this.x31 * b.x10 + this.x32 * b.x20 + this.x33 * b.x30;
    m.x01 = this.x00 * b.x01 + this.x01 * b.x11 + this.x02 * b.x21 + this.x03 * b.x31;
    m.x11 = this.x10 * b.x01 + this.x11 * b.x11 + this.x12 * b.x21 + this.x13 * b.x31;
    m.x21 = this.x20 * b.x01 + this.x21 * b.x11 + this.x22 * b.x21 + this.x23 * b.x31;
    m.x31 = this.x30 * b.x01 + this.x31 * b.x11 + this.x32 * b.x21 + this.x33 * b.x31;
    m.x02 = this.x00 * b.x02 + this.x01 * b.x12 + this.x02 * b.x22 + this.x03 * b.x32;
    m.x12 = this.x10 * b.x02 + this.x11 * b.x12 + this.x12 * b.x22 + this.x13 * b.x32;
    m.x22 = this.x20 * b.x02 + this.x21 * b.x12 + this.x22 * b.x22 + this.x23 * b.x32;
    m.x32 = this.x30 * b.x02 + this.x31 * b.x12 + this.x32 * b.x22 + this.x33 * b.x32;
    m.x03 = this.x00 * b.x03 + this.x01 * b.x13 + this.x02 * b.x23 + this.x03 * b.x33;
    m.x13 = this.x10 * b.x03 + this.x11 * b.x13 + this.x12 * b.x23 + this.x13 * b.x33;
    m.x23 = this.x20 * b.x03 + this.x21 * b.x13 + this.x22 * b.x23 + this.x23 * b.x33;
    m.x33 = this.x30 * b.x03 + this.x31 * b.x13 + this.x32 * b.x23 + this.x33 * b.x33;
    return m;
  }

  MulPosition(b: Vector): Vector {
    const x = this.x00 * b.X + this.x01 * b.Y + this.x02 * b.Z + this.x03;
    const y = this.x10 * b.X + this.x11 * b.Y + this.x12 * b.Z + this.x13;
    const z = this.x20 * b.X + this.x21 * b.Y + this.x22 * b.Z + this.x23;
    return new Vector(x, y, z);
  }

  MulPositionW(b: Vector): Vector {
    const v = this.MulPosition(b);
    const w = this.x30 * b.X + this.x31 * b.Y + this.x32 * b.Z + this.x33;
    return v.DivScalar(w);
  }

  MulDirection(b: Vector): Vector {
    const x = this.x00 * b.X + this.x01 * b.Y + this.x02 * b.Z;
    const y = this.x10 * b.X + this.x11 * b.Y + this.x12 * b.Z;
    const z = this.x20 * b.X + this.x21 * b.Y + this.x22 * b.Z;
    return new Vector(x, y, z).Normalize();
  }

  MulRay(b: Ray): Ray {
    return new Ray(this.MulPosition(b.Origin), this.MulDirection(b.Direction));
  }

  MulBox(box: Box): Box {
    const r = new Vector(this.x00, this.x10, this.x20);
    const u = new Vector(this.x01, this.x11, this.x21);
    const b = new Vector(this.x02, this.x12, this.x22);
    const t = new Vector(this.x03, this.x13, this.x23);
    let xa = r.MulScalar(box.Min.X);
    let xb = r.MulScalar(box.Max.X);
    let ya = u.MulScalar(box.Min.Y);
    let yb = u.MulScalar(box.Max.Y);
    let za = b.MulScalar(box.Min.Z);
    let zb = b.MulScalar(box.Max.Z);
    [xa, xb] = [xa.Min(xb), xa.Max(xb)];
    [ya, yb] = [ya.Min(yb), ya.Max(yb)];
    [za, zb] = [za.Min(zb), za.Max(zb)];
    return new Box(xa.Add(ya).Add(za).Add(t), xb.Add(yb).Add(zb).Add(t));
  }

  Transpose(): Matrix {
    return new Matrix(
      this.x00,
      this.x10,
      this.x20,
      this.x30,
      this.x01,
      this.x11,
      this.x21,
      this.x31,
      this.x02,
      this.x12,
      this.x22,
      this.x32,
      this.x03,
      this.x13,
      this.x23,
      this.x33,
    );
  }

  Determinant(): number {
    return (
      this.x00 * this.x11 * this.x22 * this.x33 -
      this.x00 * this.x11 * this.x23 * this.x32 +
      this.x00 * this.x12 * this.x23 * this.x31 -
      this.x00 * this.x12 * this.x21 * this.x33 +
      this.x00 * this.x13 * this.x21 * this.x32 -
      this.x00 * this.x13 * this.x22 * this.x31 -
      this.x01 * this.x12 * this.x23 * this.x30 +
      this.x01 * this.x12 * this.x20 * this.x33 -
      this.x01 * this.x13 * this.x20 * this.x32 +
      this.x01 * this.x13 * this.x22 * this.x30 -
      this.x01 * this.x10 * this.x22 * this.x33 +
      this.x01 * this.x10 * this.x23 * this.x32 +
      this.x02 * this.x13 * this.x20 * this.x31 -
      this.x02 * this.x13 * this.x21 * this.x30 +
      this.x02 * this.x10 * this.x21 * this.x33 -
      this.x02 * this.x10 * this.x23 * this.x31 +
      this.x02 * this.x11 * this.x23 * this.x30 -
      this.x02 * this.x11 * this.x20 * this.x33 -
      this.x03 * this.x10 * this.x21 * this.x32 +
      this.x03 * this.x10 * this.x22 * this.x31 -
      this.x03 * this.x11 * this.x22 * this.x30 +
      this.x03 * this.x11 * this.x20 * this.x32 -
      this.x03 * this.x12 * this.x20 * this.x31 +
      this.x03 * this.x12 * this.x21 * this.x30
    );
  }

  Inverse(): Matrix {
    const d = this.Determinant();
    return new Matrix(
      (this.x12 * this.x23 * this.x31 -
        this.x13 * this.x22 * this.x31 +
        this.x13 * this.x21 * this.x32 -
        this.x11 * this.x23 * this.x32 -
        this.x12 * this.x21 * this.x33 +
        this.x11 * this.x22 * this.x33) /
        d,
      (this.x03 * this.x22 * this.x31 -
        this.x02 * this.x23 * this.x31 -
        this.x03 * this.x21 * this.x32 +
        this.x01 * this.x23 * this.x32 +
        this.x02 * this.x21 * this.x33 -
        this.x01 * this.x22 * this.x33) /
        d,
      (this.x02 * this.x13 * this.x31 -
        this.x03 * this.x12 * this.x31 +
        this.x03 * this.x11 * this.x32 -
        this.x01 * this.x13 * this.x32 -
        this.x02 * this.x11 * this.x33 +
        this.x01 * this.x12 * this.x33) /
        d,
      (this.x03 * this.x12 * this.x21 -
        this.x02 * this.x13 * this.x21 -
        this.x03 * this.x11 * this.x22 +
        this.x01 * this.x13 * this.x22 +
        this.x02 * this.x11 * this.x23 -
        this.x01 * this.x12 * this.x23) /
        d,
      (this.x13 * this.x22 * this.x30 -
        this.x12 * this.x23 * this.x30 -
        this.x13 * this.x20 * this.x32 +
        this.x10 * this.x23 * this.x32 +
        this.x12 * this.x20 * this.x33 -
        this.x10 * this.x22 * this.x33) /
        d,
      (this.x02 * this.x23 * this.x30 -
        this.x03 * this.x22 * this.x30 +
        this.x03 * this.x20 * this.x32 -
        this.x00 * this.x23 * this.x32 -
        this.x02 * this.x20 * this.x33 +
        this.x00 * this.x22 * this.x33) /
        d,
      (this.x03 * this.x12 * this.x30 -
        this.x02 * this.x13 * this.x30 -
        this.x03 * this.x10 * this.x32 +
        this.x00 * this.x13 * this.x32 +
        this.x02 * this.x10 * this.x33 -
        this.x00 * this.x12 * this.x33) /
        d,
      (this.x02 * this.x13 * this.x20 -
        this.x03 * this.x12 * this.x20 +
        this.x03 * this.x10 * this.x22 -
        this.x00 * this.x13 * this.x22 -
        this.x02 * this.x10 * this.x23 +
        this.x00 * this.x12 * this.x23) /
        d,
      (this.x11 * this.x23 * this.x30 -
        this.x13 * this.x21 * this.x30 +
        this.x13 * this.x20 * this.x31 -
        this.x10 * this.x23 * this.x31 -
        this.x11 * this.x20 * this.x33 +
        this.x10 * this.x21 * this.x33) /
        d,
      (this.x03 * this.x21 * this.x30 -
        this.x01 * this.x23 * this.x30 -
        this.x03 * this.x20 * this.x31 +
        this.x00 * this.x23 * this.x31 +
        this.x01 * this.x20 * this.x33 -
        this.x00 * this.x21 * this.x33) /
        d,
      (this.x01 * this.x13 * this.x30 -
        this.x03 * this.x11 * this.x30 +
        this.x03 * this.x10 * this.x31 -
        this.x00 * this.x13 * this.x31 -
        this.x01 * this.x10 * this.x33 +
        this.x00 * this.x11 * this.x33) /
        d,
      (this.x03 * this.x11 * this.x20 -
        this.x01 * this.x13 * this.x20 -
        this.x03 * this.x10 * this.x21 +
        this.x00 * this.x13 * this.x21 +
        this.x01 * this.x10 * this.x23 -
        this.x00 * this.x11 * this.x23) /
        d,
      (this.x12 * this.x21 * this.x30 -
        this.x11 * this.x22 * this.x30 -
        this.x12 * this.x20 * this.x31 +
        this.x10 * this.x22 * this.x31 +
        this.x11 * this.x20 * this.x32 -
        this.x10 * this.x21 * this.x32) /
        d,
      (this.x01 * this.x22 * this.x30 -
        this.x02 * this.x21 * this.x30 +
        this.x02 * this.x20 * this.x31 -
        this.x00 * this.x22 * this.x31 -
        this.x01 * this.x20 * this.x32 +
        this.x00 * this.x21 * this.x32) /
        d,
      (this.x02 * this.x11 * this.x30 -
        this.x01 * this.x12 * this.x30 -
        this.x02 * this.x10 * this.x31 +
        this.x00 * this.x12 * this.x31 +
        this.x01 * this.x10 * this.x32 -
        this.x00 * this.x11 * this.x32) /
        d,
      (this.x01 * this.x12 * this.x20 -
        this.x02 * this.x11 * this.x20 +
        this.x02 * this.x10 * this.x21 -
        this.x00 * this.x12 * this.x21 -
        this.x01 * this.x10 * this.x22 +
        this.x00 * this.x11 * this.x22) /
        d,
    );
  }
}
