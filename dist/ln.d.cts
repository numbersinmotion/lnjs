declare class Vector {
    X: number;
    Y: number;
    Z: number;
    constructor(X: number, Y: number, Z: number);
    static RandomUnitVector(): Vector;
    Length(): number;
    Distance(b: Vector): number;
    LengthSquared(): number;
    DistanceSquared(b: Vector): number;
    Dot(b: Vector): number;
    Cross(b: Vector): Vector;
    Normalize(): Vector;
    Add(b: Vector): Vector;
    Sub(b: Vector): Vector;
    Mul(b: Vector): Vector;
    Div(b: Vector): Vector;
    AddScalar(b: number): Vector;
    SubScalar(b: number): Vector;
    MulScalar(b: number): Vector;
    DivScalar(b: number): Vector;
    Min(b: Vector): Vector;
    Max(b: Vector): Vector;
    MinAxis(): Vector;
    MinComponent(): number;
    SegmentDistance(v: Vector, w: Vector): number;
}

declare class Ray {
    Origin: Vector;
    Direction: Vector;
    constructor(Origin: Vector, Direction: Vector);
    Position(t: number): Vector;
}

declare enum Axis {
    AxisNone = 0,
    AxisX = 1,
    AxisY = 2,
    AxisZ = 3
}

declare class Hit {
    Shape: IShape;
    T: number;
    constructor(Shape: IShape, T: number);
    static NoHit(): Hit;
    Ok(): boolean;
    Min(b: Hit): Hit;
    Max(b: Hit): Hit;
}

declare class Matrix {
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
    constructor(x00: number, x01: number, x02: number, x03: number, x10: number, x11: number, x12: number, x13: number, x20: number, x21: number, x22: number, x23: number, x30: number, x31: number, x32: number, x33: number);
    static Zero(): Matrix;
    static Identity(): Matrix;
    static Translate(v: Vector): Matrix;
    static Scale(v: Vector): Matrix;
    static Rotate(v: Vector, a: number): Matrix;
    static Frustum(l: number, r: number, b: number, t: number, n: number, f: number): Matrix;
    static Orthographic(l: number, r: number, b: number, t: number, n: number, f: number): Matrix;
    static Perspective(fovy: number, aspect: number, near: number, far: number): Matrix;
    static LookAt(eye: Vector, center: Vector, up: Vector): Matrix;
    Translate(v: Vector): Matrix;
    Scale(v: Vector): Matrix;
    Rotate(v: Vector, a: number): Matrix;
    Frustum(l: number, r: number, b: number, t: number, n: number, f: number): Matrix;
    Orthographic(l: number, r: number, b: number, t: number, n: number, f: number): Matrix;
    Perspective(fovy: number, aspect: number, near: number, far: number): Matrix;
    Mul(b: Matrix): Matrix;
    MulPosition(b: Vector): Vector;
    MulPositionW(b: Vector): Vector;
    MulDirection(b: Vector): Vector;
    MulRay(b: Ray): Ray;
    MulBox(box: Box): Box;
    Transpose(): Matrix;
    Determinant(): number;
    Inverse(): Matrix;
}

interface IFilter {
    Filter(v: Vector): [Vector, boolean];
}

declare class Path extends Array<Vector> {
    static FromVectors(vectors: Vector[]): Path;
    BoundingBox(): Box;
    Transform(matrix: Matrix): Path;
    Chop(step: number): Path;
    Filter(f: IFilter): Paths;
    Simplify(threshold: number): Path;
}

declare class Paths extends Array<Path> {
    static FromVectors(vectors: Vector[][]): Paths;
    static FromPaths(paths: Path[]): Paths;
    BoundingBox(): Box;
    Transform(matrix: Matrix): Paths;
    Chop(step: number): Paths;
    Filter(f: IFilter): Paths;
    Simplify(threshold: number): Paths;
}

declare class TriangleShape implements IShape {
    V1: Vector;
    V2: Vector;
    V3: Vector;
    Box: Box;
    constructor(V1: Vector, V2: Vector, V3: Vector);
    UpdateBoundingBox(): void;
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare class Box {
    Min: Vector;
    Max: Vector;
    constructor(Min: Vector, Max: Vector);
    static BoxForTriangles(triangles: TriangleShape[]): Box;
    static BoxForShapes(shapes: IShape[]): Box;
    static BoxForVectors(vectors: Vector[]): Box;
    Anchor(anchor: Vector): Vector;
    Center(): Vector;
    Size(): Vector;
    Contains(b: Vector): boolean;
    Extend(b: Box): Box;
    Intersect(r: Ray): [number, number];
    Partition(axis: Axis, point: number): [boolean, boolean];
}

interface IShape {
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare class Node {
    Axis: Axis;
    Point: number;
    Shapes: IShape[];
    Left?: Node;
    Right?: Node;
    constructor(shapes: IShape[]);
    Intersect(r: Ray, tmin: number, tmax: number): Hit;
    IntersectShapes(r: Ray): Hit;
    PartitionScore(axis: Axis, point: number): number;
    Partition(size: number, axis: Axis, point: number): [IShape[], IShape[]];
    Split(depth: number): void;
}

declare class Tree {
    Box: Box;
    Root: Node;
    constructor(shapes: IShape[]);
    Intersect(r: Ray): Hit;
}

declare class Scene {
    Shapes: IShape[];
    Tree?: Tree;
    constructor();
    Compile(): void;
    Add(shape: IShape): void;
    Intersect(r: Ray): Hit;
    Visible(eye: Vector, point: Vector): boolean;
    Paths(): Paths;
    Render(eye: Vector, center: Vector, up: Vector, width: number, height: number, fovy: number, near: number, far: number, step: number): Paths;
    RenderOrthographic(eye: Vector, center: Vector, up: Vector, width: number, height: number, left: number, right: number, bottom: number, top: number, near: number, far: number, step: number): Paths;
    RenderWithMatrix(matrix: Matrix, eye: Vector, width: number, height: number, step: number): Paths;
}

declare class ClipFilter implements IFilter {
    Matrix: Matrix;
    Eye: Vector;
    Scene: Scene;
    constructor(Matrix: Matrix, Eye: Vector, Scene: Scene);
    static ClipBox: Box;
    Filter(v: Vector): [Vector, boolean];
}

declare const Core: {
    ClipFilter: typeof ClipFilter;
    Scene: typeof Scene;
};

declare function Radians(degrees: number): number;
declare function Degrees(radians: number): number;
declare function Median(items: number[]): number;

declare const Math: {
    Axis: typeof Axis;
    Box: typeof Box;
    Degrees: typeof Degrees;
    Hit: typeof Hit;
    Matrix: typeof Matrix;
    Median: typeof Median;
    Node: typeof Node;
    Path: typeof Path;
    Paths: typeof Paths;
    Radians: typeof Radians;
    Ray: typeof Ray;
    Tree: typeof Tree;
    Vector: typeof Vector;
};

declare class EmptyShape implements IShape {
    constructor();
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare class TransformShape implements IShape {
    Shape: IShape;
    Matrix: Matrix;
    Inverse: Matrix;
    constructor(Shape: IShape, Matrix: Matrix);
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare class BoxShape implements IShape {
    Min: Vector;
    Max: Vector;
    Box: Box;
    constructor(Min: Vector, Max: Vector);
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare enum CsgShapeOperation {
    Intersection = 0,
    Difference = 1,
    Union = 2
}
declare class CsgShape implements IShape {
    ShapeA: IShape;
    ShapeB: IShape;
    Operation: CsgShapeOperation;
    constructor(ShapeA: IShape, ShapeB: IShape, Operation: CsgShapeOperation);
    static Intersection(ShapeA: IShape, ShapeB: IShape): CsgShape;
    static Difference(ShapeA: IShape, ShapeB: IShape): CsgShape;
    static Union(ShapeA: IShape, ShapeB: IShape): CsgShape;
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare enum FunctionShapeDirection {
    Above = 0,
    Below = 1
}
declare class FunctionShape implements IShape {
    Function: (x: number, y: number) => number;
    Box: Box;
    Direction: FunctionShapeDirection;
    constructor(Function: (x: number, y: number) => number, Box: Box, Direction: FunctionShapeDirection);
    static Above(Function: (x: number, y: number) => number, Box: Box): FunctionShape;
    static Below(Function: (x: number, y: number) => number, Box: Box): FunctionShape;
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare class SphereShape implements IShape {
    Center: Vector;
    Radius: number;
    Box: Box;
    constructor(Center: Vector, Radius: number);
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
}

declare class CylinderShape implements IShape {
    Radius: number;
    Z0: number;
    Z1: number;
    Box: Box;
    constructor(Radius: number, Z0: number, Z1: number);
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(ray: Ray): Hit;
    Paths(): Paths;
}

declare class MeshShape implements IShape {
    Triangles: TriangleShape[];
    Box: Box;
    Tree?: Tree;
    constructor(Triangles: TriangleShape[]);
    static FromObjString(objString: string): MeshShape;
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
    UpdateBoundingBox(): void;
    UnitCube(): void;
    MoveTo(position: Vector, anchor: Vector): void;
    FitInside(box: Box, anchor: Vector): void;
    Transform(matrix: Matrix): void;
}

declare class SilhouetteMeshShape implements IShape {
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
    constructor(Triangles: TriangleShape[], Edges: {
        [id: string]: {
            t1Index: number;
            t2Index: number;
            t1VIndex: number;
        };
    }, Eye: Vector, SilhouetteEpsilon: number);
    static FromMesh(vertices: Vector[], faces: {
        i1: number;
        i2: number;
        i3: number;
    }[], eye: Vector, silhouetteEpsilon: number): SilhouetteMeshShape;
    static FromObjString(objString: string, eye: Vector, SilhouetteEpsilon: number): SilhouetteMeshShape;
    Compile(): void;
    BoundingBox(): Box;
    Contains(v: Vector, f: number): boolean;
    Intersect(r: Ray): Hit;
    Paths(): Paths;
    UpdateBoundingBox(): void;
    UnitCube(): void;
    MoveTo(position: Vector, anchor: Vector): void;
    FitInside(box: Box, anchor: Vector): void;
    Transform(matrix: Matrix): void;
}

declare const Shapes: {
    EmptyShape: typeof EmptyShape;
    TransformShape: typeof TransformShape;
    BoxShape: typeof BoxShape;
    CsgShape: typeof CsgShape;
    FunctionShape: typeof FunctionShape;
    SphereShape: typeof SphereShape;
    TriangleShape: typeof TriangleShape;
    CylinderShape: typeof CylinderShape;
    MeshShape: typeof MeshShape;
    SilhouetteMeshShape: typeof SilhouetteMeshShape;
};

export { Core, Math, Shapes };
