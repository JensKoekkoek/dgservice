"use strict";
var Dir;
(function (Dir) {
    Dir[Dir["Invalid"] = -1] = "Invalid";
    Dir[Dir["W"] = 0] = "W";
    Dir[Dir["N"] = 1] = "N";
    Dir[Dir["E"] = 2] = "E";
    Dir[Dir["S"] = 3] = "S";
})(Dir || (Dir = {}));
const NUM_DIRS = 4;
(function (Dir) {
    function flip(dir) { return (dir + 2) % 4; }
    Dir.flip = flip;
    function toPoint(dir) {
        switch (dir) {
            case Dir.W:
                return pt(-1, 0);
            case Dir.N:
                return pt(0, -1);
            case Dir.E:
                return pt(1, 0);
            case Dir.S:
                return pt(0, 1);
            default:
                return pt(0, 0);
        }
    }
    Dir.toPoint = toPoint;
    function fromPoint({ x, y }) {
        if (y === 0) {
            if (x === 0)
                return Dir.Invalid;
            return x < 0 ? Dir.W : Dir.E;
        }
        else if (x === 0) {
            return y < 0 ? Dir.N : Dir.S;
        }
        return Dir.Invalid;
    }
    Dir.fromPoint = fromPoint;
    function parse(str) {
        return Dir[str];
    }
    Dir.parse = parse;
})(Dir || (Dir = {}));
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static equals(left, right) { return left.x === right.x && left.y === right.y; }
    ;
    static add({ x: x1, y: y1 }, { x: x2, y: y2 }) { return pt(x1 + x2, y1 + y2); }
    static scale({ x, y }, f) { return pt(x * f, y * f); }
    static str({ x, y }) { return `(${x}, ${y})`; }
}
function pt(x, y) { return new Point(x, y); }
class Permutation {
    /**
     * 0: where W goes, 1: where N goes, 2: where E goes, 3: where S goes.
     * Default is the identity.
     */
    constructor(map = [Dir.W, Dir.N, Dir.E, Dir.S]) {
        this.map = map;
    }
    apply(dir) { return this.map[dir]; }
    compose(right) {
        return new Permutation([this.map[right.map[0]], this.map[right.map[1]], this.map[right.map[2]], this.map[right.map[3]]]);
    }
    inverse() {
        let map = [];
        for (let i = 0; i < NUM_DIRS; i++) {
            map[this.map[i]] = i;
        }
        return new Permutation(map);
    }
    equals(other) {
        return this.map.every((v, i) => other.map[i] === v);
    }
    toMatrix() {
        let { x: a, y: b } = Dir.toPoint(this.apply(Dir.E));
        let { x: c, y: d } = Dir.toPoint(this.apply(Dir.S));
        return { a, b, c, d };
    }
}
let identity = new Permutation();
let flipHorizontal = new Permutation([Dir.E, Dir.N, Dir.W, Dir.S]);
let flipVertical = new Permutation([Dir.W, Dir.S, Dir.E, Dir.N]);
let rotateClockwise = new Permutation([Dir.N, Dir.E, Dir.S, Dir.W]);
let rotateCounterclockwise = new Permutation([Dir.S, Dir.W, Dir.N, Dir.E]);
let rotate180 = new Permutation([Dir.E, Dir.S, Dir.W, Dir.N]);
class Room {
    constructor(id) {
        this.id = id;
        /** E, N, W, S in that order */
        this.neighbors = [];
        this.transitionFunctions = [new Permutation(), new Permutation(), new Permutation(), new Permutation()];
        this.visited = false;
        this.color = id >= Room.colors.length ? "black" : Room.colors[id];
    }
    to(dir) {
        return this.neighbors[dir];
    }
    degree() {
        return this.neighbors.filter(x => x != null).length;
    }
    getColor() {
        return this.color;
    }
    connect(dir, other, otherDir = Dir.flip(dir), flipOrientation = false) {
        // Compute the transition function
        let map = [];
        for (let d = 0; d < NUM_DIRS; d++) {
            map[d] = ((flipOrientation ? -1 : 1) * (d - dir) + Dir.flip(otherDir) + NUM_DIRS) % NUM_DIRS;
        }
        return this.connectByTransitionFunction(dir, other, new Permutation(map));
    }
    connectByTransitionFunction(dir, other, transitionFunction = new Permutation()) {
        let targetDir = Dir.flip(transitionFunction.apply(dir));
        if (other == null) {
            return { success: false, error: `Cannot connect ${this} to null.` };
        }
        let errorPrefix = `Can't connect ${this.id} to ${other.id}`;
        if (this.neighbors[dir] != null && Room.enforceBidirectional) {
            return { success: false, error: `${errorPrefix}; ${Dir[dir]} edge out of ${this} is already taken.` };
        }
        if (other.neighbors[targetDir] != null) {
            if (Room.enforceBidirectional)
                return { success: false, error: `${errorPrefix}; ${Dir[targetDir]} edge into ${other} is already taken.` };
            console.log(`Warning: ${Dir[targetDir]} edge into ${other} is already taken.`);
        }
        else {
            other.neighbors[targetDir] = this;
            other.transitionFunctions[targetDir] = transitionFunction.inverse();
        }
        this.neighbors[dir] = other;
        this.transitionFunctions[dir] = transitionFunction;
        return { success: true, error: "" };
    }
    toString() {
        return this.id.toString();
    }
}
Room.colors = ["black", "blue", "green", "red", "#7f00ff", "maroon", "turquoise", "black", "gray"];
Room.enforceBidirectional = true;
var Connection;
(function (Connection) {
    Connection.regex = /^(\d+)([WNES])(\d+)([WNES]?)(['!]?)$/;
    function parse(str, roomList = []) {
        let arr = str.toUpperCase().match(Connection.regex);
        if (arr === null) {
            throw `Cannot parse string ${str}.`;
        }
        let s = parseInt(arr[1]) - 1;
        if (!(s in roomList))
            roomList[s] = new Room(s + 1);
        let t = parseInt(arr[3]) - 1;
        if (!(t in roomList))
            roomList[t] = new Room(t + 1);
        return {
            s: roomList[s],
            sDir: Dir.parse(arr[2]),
            t: roomList[t],
            tDir: Dir.parse(arr[4]),
            flip: arr[5] !== ""
        };
    }
    Connection.parse = parse;
    function parseMany(str, roomList) {
        return str.split(/[,\s]+/).map(s => parse(s, roomList));
    }
    Connection.parseMany = parseMany;
    function execute(list) {
        for (let c of list) {
            let r = c.s.connect(c.sDir, c.t, c.tDir, c.flip);
            if (!r.success) {
                throw r.error;
            }
        }
    }
    Connection.execute = execute;
})(Connection || (Connection = {}));
class RoomView {
    constructor(room, transform = new Permutation()) {
        this.room = room;
        this.transform = transform;
    }
    to(dir) {
        let actual = this.transform.apply(dir);
        let newRoom = this.room.to(actual);
        if (newRoom == null)
            return null;
        let transition = this.room.transitionFunctions[actual];
        return new RoomView(newRoom, transition.compose(this.transform));
    }
    id() { return this.room.id; }
    getColor() { return this.room.getColor(); }
    visited() { return this.room.visited; }
    setVisited(value) { this.room.visited = value; }
    equals(other) {
        return this.room === other.room && this.transform.equals(other.transform);
    }
    drawEdge(context, { x, y }, dir) {
        if (context == null)
            return;
        let c = toClientCoords({ x, y });
        let p0 = Point.add(c, Point.scale(Dir.toPoint(dir), roomInnerSize / 2));
        let p1 = Point.add(p0, Point.scale(Dir.toPoint(dir), edgeLength));
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(p0.x, p0.y);
        context.lineTo(p1.x, p1.y);
        context.stroke();
    }
    draw(context, { x, y }) {
        if (context != null) {
            context.font = "36px sans-serif";
            let text = this.visited() ? this.id().toString() : "?";
            let color = this.visited() ? this.getColor() : "#aaa";
            let c = toClientCoords({ x, y });
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = color;
            context.strokeStyle = color;
            context.lineWidth = x === 0 && y === 0 ? 10 : 2;
            // Transform
            context.save();
            if (this.visited()) {
                let mat = this.transform.inverse().toMatrix();
                context.translate(c.x, c.y);
                context.transform(mat.a, mat.b, mat.c, mat.d, 0, 0);
                context.translate(-c.x, -c.y);
            }
            context.strokeRect(c.x - roomInnerSize / 2, c.y - roomInnerSize / 2, roomInnerSize, roomInnerSize);
            context.fillText(text, c.x, c.y);
            context.restore();
            if (this.visited()) {
                // Draw edges
                for (let i = 0; i < 4; i++) {
                    if (this.to(i) != null) {
                        this.drawEdge(context, { x, y }, i);
                    }
                }
            }
        }
    }
}
