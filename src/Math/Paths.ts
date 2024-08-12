import { Path } from './Path';
import { Box } from './Box';
import { Matrix } from './Matrix';
import { IFilter } from '../Core/IFilter';
import { Vector } from './Vector';

export class Paths extends Array<Path> {
  static FromVectors(vectors: Vector[][]): Paths {
    let paths = new Paths();
    for (const path of vectors) {
      paths.push(Path.FromVectors(path));
    }
    return paths;
  }

  static FromPaths(paths: Path[]): Paths {
    let result = new Paths();
    result.push(...paths);
    return result;
  }

  BoundingBox(): Box {
    let box = this[0].BoundingBox();
    for (const path of this) {
      box = box.Extend(path.BoundingBox());
    }
    return box;
  }

  Transform(matrix: Matrix): Paths {
    const result = new Paths();
    for (const path of this) {
      result.push(path.Transform(matrix));
    }
    return result;
  }

  Chop(step: number): Paths {
    const result = new Paths();
    for (const path of this) {
      result.push(path.Chop(step));
    }
    return result;
  }

  Filter(f: IFilter): Paths {
    const result = new Paths();
    for (const path of this) {
      result.push(...path.Filter(f));
    }
    return result;
  }

  Simplify(threshold: number): Paths {
    const result = new Paths();
    for (const path of this) {
      result.push(path.Simplify(threshold));
    }
    return result;
  }
}
