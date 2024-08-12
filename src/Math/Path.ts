import { Vector } from './Vector';
import { Box } from './Box';
import { Matrix } from './Matrix';
import { IFilter } from '../Core/IFilter';
import { Paths } from './Paths';

export class Path extends Array<Vector> {
  static FromVectors(vectors: Vector[]): Path {
    let path = new Path();
    path.push(...vectors);
    return path;
  }

  BoundingBox(): Box {
    return Box.BoxForVectors(this);
  }

  Transform(matrix: Matrix): Path {
    let result = new Path();
    for (let v of this) {
      result.push(matrix.MulPosition(v));
    }
    return result;
  }

  Chop(step: number): Path {
    let result = new Path();
    for (let i = 0; i < this.length - 1; i++) {
      let a = this[i];
      let b = this[i + 1];
      let v = b.Sub(a);
      let l = v.Length();
      if (i === 0) {
        result.push(a);
      }
      let d = step;
      while (d < l) {
        result.push(a.Add(v.MulScalar(d / l)));
        d += step;
      }
      result.push(b);
    }
    return result;
  }

  Filter(f: IFilter): Paths {
    const result = new Paths();
    let path = new Path();
    for (let v of this) {
      let [filteredV, ok] = f.Filter(v);
      if (ok) {
        path.push(filteredV);
      } else {
        if (path.length > 1) {
          result.push(path);
        }
        path = new Path();
      }
    }
    if (path.length > 1) {
      result.push(path);
    }
    return result;
  }

  Simplify(threshold: number): Path {
    if (this.length < 3) {
      return this;
    }
    let a = this[0];
    let b = this[this.length - 1];
    let index = -1;
    let distance = 0.0;
    for (let i = 1; i < this.length - 1; i++) {
      let d = this[i].SegmentDistance(a, b);
      if (d > distance) {
        index = i;
        distance = d;
      }
    }
    if (distance > threshold) {
      let r1 = new Path(...this.slice(0, index + 1)).Simplify(threshold);
      let r2 = new Path(...this.slice(index)).Simplify(threshold);
      return new Path(...r1.slice(0, r1.length - 1).concat(r2));
    } else {
      return new Path(a, b);
    }
  }
}
