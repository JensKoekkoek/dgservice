declare enum Dir {
    Invalid = -1,
    W = 0,
    N = 1,
    E = 2,
    S = 3
}
declare const NUM_DIRS = 4;
declare namespace Dir {
    function flip(dir: Dir): number;
    function toPoint(dir: Dir): Point;
    function fromPoint({ x, y }: Point): Dir;
    function parse(str: string): Dir.W | Dir.N | Dir.E | Dir.S;
}
declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
    static equals(left: Point, right: Point): boolean;
    static add({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): Point;
    static scale({ x, y }: Point, f: number): Point;
    static str({ x, y }: Point): string;
}
declare function pt(x: number, y: number): Point;
declare class Permutation {
    map: Dir[];
    /**
     * 0: where W goes, 1: where N goes, 2: where E goes, 3: where S goes.
     * Default is the identity.
     */
    constructor(map?: Dir[]);
    apply(dir: Dir): Dir;
    compose(right: Permutation): Permutation;
    inverse(): Permutation;
    equals(other: Permutation): boolean;
    toMatrix(): {
        a: number;
        b: number;
        c: number;
        d: number;
    };
}
declare let identity: Permutation;
declare let flipHorizontal: Permutation;
declare let flipVertical: Permutation;
declare let rotateClockwise: Permutation;
declare let rotateCounterclockwise: Permutation;
declare let rotate180: Permutation;
declare class Room {
    id: number;
    static colors: string[];
    static enforceBidirectional: boolean;
    constructor(id: number);
    /** E, N, W, S in that order */
    neighbors: (Room | null)[];
    transitionFunctions: Permutation[];
    visited: boolean;
    color: string;
    to(dir: Dir): Room | null;
    degree(): number;
    getColor(): string;
    connect(dir: Dir, other: Room, otherDir?: number, flipOrientation?: boolean): {
        success: boolean;
        error: string;
    };
    connectByTransitionFunction(dir: Dir, other: Room, transitionFunction?: Permutation): {
        success: boolean;
        error: string;
    };
    toString(): string;
}
interface Connection {
    s: Room;
    sDir: Dir;
    t: Room;
    tDir?: Dir;
    flip?: boolean;
}
declare namespace Connection {
    var regex: RegExp;
    function parse(str: string, roomList?: Room[]): Connection;
    function parseMany(str: string, roomList: Room[]): Connection[];
    function execute(list: Connection[]): void;
}
declare class RoomView {
    room: Room;
    transform: Permutation;
    constructor(room: Room, transform?: Permutation);
    to(dir: Dir): RoomView | null;
    id(): number;
    getColor(): string;
    visited(): boolean;
    setVisited(value: boolean): void;
    equals(other: RoomView): boolean;
    drawEdge(context: CanvasRenderingContext2D | null, { x, y }: Point, dir: Dir): void;
    draw(context: CanvasRenderingContext2D | null, { x, y }: Point): void;
}
