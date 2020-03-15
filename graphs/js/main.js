"use strict";
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
            vm.$set(roomList, s, new Room(s + 1, vm.godMode));
        let t = parseInt(arr[3]) - 1;
        if (!(t in roomList))
            vm.$set(roomList, t, new Room(t + 1, vm.godMode));
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
            let r = c.s.connect({ dir: c.sDir, other: c.t, otherDir: c.tDir, flipOrientation: c.flip, allowMultipleInEdges: vm.allowMultipleInEdges });
            if (!r.success) {
                throw r.error;
            }
        }
    }
    Connection.execute = execute;
})(Connection || (Connection = {}));
let u = new URLSearchParams(location.search);
const defaults = {
    godMode: true,
    allowMultipleInEdges: false,
    graph: "custom",
    code: ""
};
const MyApp = Vue.extend({
    data() {
        return {
            godMode: u.get("godMode") !== "false",
            allowMultipleInEdges: u.get("allowMultipleInEdges") === "true",
            graph: u.get("graph") || "mobius",
            code: u.get("code") || defaults.code,
            rooms: [],
            invalidCodeFeedback: ""
        };
    }
});
const vm = new MyApp({
    el: "#app",
    data: {},
    computed: {
        statusText: function () {
            let notVisited = this.rooms.filter(r => !r.visited).map(r => r.id);
            return notVisited.length === 0 ? "Congratulations! You found all the rooms!" : `${notVisited.length} rooms left to find: ${notVisited.join(", ")}`;
        }
    },
    watch: {
        godMode: function () {
            console.log(this);
        },
        graph: function () {
            setGraph();
        },
        code: function () {
            customCodeInput.setCustomValidity("");
            codeForm.classList.remove("was-validated");
        }
    }
});
const mainCanvas = document.querySelector("#mainCanvas");
const context = mainCanvas.getContext("2d");
const codeForm = document.querySelector("#codeForm");
const customCodeInput = document.querySelector("#customCode");
const codeSubmit = document.querySelector("#codeSubmit");
let roomOuterSize = 100;
let edgeLength = 16;
let roomInnerSize = roomOuterSize - edgeLength;
let roomView;
let moveMapping = { ArrowLeft: Dir.W, ArrowRight: Dir.E, ArrowUp: Dir.N, ArrowDown: Dir.S };
let turnMapping = {
    ArrowLeft: rotateCounterclockwise,
    ArrowRight: rotateClockwise
};
let centerX = mainCanvas.width / 2;
let centerY = mainCanvas.height / 2;
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function toClientCoords({ x, y }) {
    let centerX = mainCanvas.width / 2;
    let centerY = mainCanvas.height / 2;
    return pt(centerX + x * roomOuterSize, centerY + y * roomOuterSize);
}
function toGameCoords({ x, y }) {
    let centerX = mainCanvas.width / 2;
    let centerY = mainCanvas.height / 2;
    return pt((x - centerX) / roomOuterSize, (y - centerY) / roomOuterSize);
}
function drawRoom(location, roomView) {
    if (roomView != null)
        roomView.draw(context, location);
}
function renderCorner(a, b) {
    let ra = roomView.to(a);
    let rb = roomView.to(b);
    let oa = Dir.toPoint(a);
    let ob = Dir.toPoint(b);
    let o = Point.add(oa, ob);
    let x = centerX + (oa.x + ob.x) * roomOuterSize;
    let y = centerY + (oa.y + ob.y) * roomOuterSize;
    if (ra == null && rb != null && rb.visited()) {
        drawRoom(o, rb.to(a));
    }
    else if (rb == null && ra != null && ra.visited()) {
        drawRoom(o, ra.to(b));
    }
    else if (ra != null && rb != null && ra.visited() && rb.visited()) {
        let corner1 = ra.to(b), corner2 = rb.to(a);
        // Needs to be a commutative diagram!
        if (corner1 != null && corner2 != null && corner1.equals(corner2)) {
            drawRoom(o, corner1);
        }
    }
}
function render() {
    if (mainCanvas != null && context != null) {
        context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        for (let i = 0; i < 4; i++) {
            let x = roomView.to(i);
            if (x == null)
                continue;
            let o = Dir.toPoint(i);
            drawRoom(o, x);
        }
        renderCorner(Dir.E, Dir.N);
        renderCorner(Dir.W, Dir.N);
        renderCorner(Dir.E, Dir.S);
        renderCorner(Dir.W, Dir.S);
        drawRoom(pt(0, 0), roomView);
    }
    let leftToFind = vm.rooms.filter(r => !r.visited);
    // statusSpan!.innerText = leftToFind.length === 0 ? "Congratulations! You won!" : `${leftToFind.length} rooms left to find: ${leftToFind.join(", ")}`;
}
function movePlayer(dir) {
    let neighbor = roomView.to(dir);
    if (neighbor != null) {
        roomView = neighbor;
        roomView.setVisited(true);
    }
    render();
}
function reset2(numRooms, connections) {
    vm.rooms = [];
    for (let i = 1; i <= numRooms; i++) {
        vm.rooms.push(new Room(i, vm.godMode));
    }
    for (let c of connections) {
        let r = vm.rooms[c.s - 1].connect({ dir: c.sDir, other: vm.rooms[c.t - 1], otherDir: c.tDir, flipOrientation: c.flip, allowMultipleInEdges: vm.allowMultipleInEdges });
        if (!r.success) {
            throw r.error;
        }
    }
    roomView = new RoomView(vm.rooms[0]);
    roomView.setVisited(true);
    render();
}
function resetWithCode(str) {
    vm.rooms = [new Room(1, true)];
    let cList = Connection.parseMany(str, vm.rooms);
    Connection.execute(cList);
    roomView = new RoomView(vm.rooms[0]);
    if (vm.godMode) {
        vm.rooms.forEach(r => r.visited = true);
    }
    render();
}
function resetToMobiusStrip(width = 10, height = 3) {
    let connections = [];
    for (let y = 0; y < height; y++) {
        for (let x = 1; x <= width; x++) {
            if (x < width)
                connections.push({ sDir: Dir.E, s: y * width + x, t: y * width + (x % width + 1) });
            if (y < height - 1)
                connections.push({ sDir: Dir.S, s: y * width + x, t: ((y + 1) % height) * width + x });
        }
    }
    // Connect right edge flipped to left edge
    for (let y = 0; y < height; y++) {
        connections.push({ sDir: Dir.E, s: (y + 1) * width, t: (height - y - 1) * width + 1, flip: true });
    }
    reset2(width * height, connections);
}
function resetToKleinBottle(width = 4, height = 4) {
    let connections = [];
    for (let y = 0; y < height; y++) {
        for (let x = 1; x <= width; x++) {
            if (x < width)
                connections.push({ sDir: Dir.E, s: y * width + x, t: y * width + (x % width + 1) });
            connections.push({ sDir: Dir.S, s: y * width + x, t: ((y + 1) % height) * width + x });
        }
    }
    // Connect right edge flipped to left edge
    for (let y = 0; y < height; y++) {
        connections.push({ sDir: Dir.E, s: (y + 1) * width, t: (height - y - 1) * width + 1, flip: true });
    }
    reset2(width * height, connections);
}
function resetToProjectivePlane(width = 4, height = 4) {
    let connections = [];
    for (let y = 0; y < height; y++) {
        for (let x = 1; x <= width; x++) {
            if (x < width)
                connections.push({ sDir: Dir.E, s: y * width + x, t: y * width + (x % width + 1) });
            if (y < height - 1)
                connections.push({ sDir: Dir.S, s: y * width + x, t: ((y + 1) % height) * width + x });
        }
    }
    // Connect right edge flipped to left edge
    for (let y = 0; y < height; y++) {
        connections.push({ sDir: Dir.E, s: (y + 1) * width, t: (height - y - 1) * width + 1, flip: true });
    }
    for (let x = 1; x <= width; x++) {
        connections.push({ sDir: Dir.N, s: x, t: (height - 1) * width + (width + 1 - x), flip: true });
    }
    reset2(width * height, connections);
}
function resetToWeirdGraph() {
    vm.rooms = [];
    for (let i = 1; i <= 12; i++) {
        vm.rooms.push(new Room(i, vm.godMode));
    }
    for (let r = 0; r < vm.rooms.length; r++) {
        let j = r + 1;
        for (let i = 0; i < 4; i++) {
            vm.rooms[r].connectByTransitionFunction({ dir: i, other: vm.rooms[j++], allowMultipleInEdges: vm.allowMultipleInEdges });
        }
    }
    roomView = new RoomView(vm.rooms[0]);
    roomView.setVisited(true);
    render();
}
function resetToMobiusStrip2(size = 4) {
    let connections = [];
    for (let i = 1; i <= size - 1; i++) {
        connections.push({ sDir: Dir.E, s: i, t: i + 1 });
        connections.push({ sDir: Dir.E, s: i + size, t: i + size + 1 });
    }
    for (let i = 1; i <= size; i++) {
        connections.push({ sDir: Dir.S, s: i, t: i + size });
    }
    connections.push({ sDir: Dir.E, s: size, t: 1, tDir: Dir.N });
    connections.push({ sDir: Dir.E, s: 2 * size, t: size + 1, tDir: Dir.S });
    reset2(2 * size, connections);
}
function resetRandom() {
    vm.rooms = [];
    for (let i = 1; i <= 50; i++) {
        let room = new Room(i, vm.godMode);
        if (i >= Room.colors.length)
            room.color = getRandomColor();
        vm.rooms.push(room);
    }
    for (let r = 0; r < vm.rooms.length; r++) {
        let j = r + 1;
        for (let i = 0; i < 4; i++) {
            let other = vm.rooms[Math.floor(Math.random() * vm.rooms.length)];
            while (other === vm.rooms[r]) {
                other = vm.rooms[Math.floor(Math.random() * vm.rooms.length)];
            }
            vm.rooms[r].connectByTransitionFunction({ dir: i, other, allowMultipleInEdges: vm.allowMultipleInEdges });
        }
    }
    roomView = new RoomView(vm.rooms[0]);
    roomView.setVisited(true);
    render();
}
function resetCustom() {
    try {
        resetWithCode(vm.code);
        customCodeInput.setCustomValidity("");
        vm.graph = "custom";
        return true;
    }
    catch (ex) {
        customCodeInput.setCustomValidity(ex);
        vm.invalidCodeFeedback = ex;
    }
    return false;
}
function setGraph() {
    var _a;
    if (vm.graph === "custom")
        resetCustom();
    else {
        let code = (_a = document.querySelector(`#graphSelect option[value='${vm.graph}']`)) === null || _a === void 0 ? void 0 : _a.getAttribute("data-code");
        if (code != null) {
            resetWithCode(code);
        }
        else {
            switch (vm.graph) {
                case "B":
                    resetToWeirdGraph();
                    break;
                case "mobius":
                    resetToMobiusStrip();
                    break;
                case "klein":
                    resetToKleinBottle();
                    break;
                case "projective":
                    resetToProjectivePlane();
                    break;
                case "mobius2":
                    resetToMobiusStrip2();
                    break;
                case "random":
                    resetRandom();
                    break;
                case "custom":
                    resetCustom();
                    break;
            }
        }
    }
    updateHistoryState();
}
function updateHistoryState(replace = true) {
    let state = {
        godMode: vm.godMode,
        allowMultipleInEdges: vm.allowMultipleInEdges,
        graph: vm.graph,
        code: vm.code
    };
    let params = new URLSearchParams(state);
    for (let key in state) {
        if (state[key] === defaults[key])
            params.delete(key);
    }
    if (state.graph !== "custom")
        params.delete("code");
    let url = "?" + params.toString();
    if (replace)
        history.replaceState(state, "", url);
    else
        history.pushState(state, "", url);
}
// Event listeners
document.querySelector("#codeForm").addEventListener("submit", () => {
    if (resetCustom()) {
        updateHistoryState(false);
    }
    codeForm.classList.add("was-validated");
});
mainCanvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
        e.preventDefault();
        mainCanvas.focus();
        let c = pt(e.offsetX, e.offsetY);
        let p = toGameCoords(c);
        let pf = pt(Math.round(p.x), Math.round(p.y));
        let dir = Dir.fromPoint(pf);
        if (dir >= 0) {
            movePlayer(dir);
        }
    }
});
document.addEventListener("keydown", e => {
    if (!e.shiftKey && e.key in moveMapping) {
        if (e.target !== customCodeInput)
            e.preventDefault();
        let dir = moveMapping[e.key];
        movePlayer(dir);
    }
    else if (e.shiftKey && e.key in turnMapping) {
        if (e.target !== customCodeInput)
            e.preventDefault();
        roomView.transform = roomView.transform.compose(turnMapping[e.key]);
        render();
    }
});
addEventListener("popstate", e => {
    var _a;
    let state = (_a = e.state) !== null && _a !== void 0 ? _a : defaults;
    vm.godMode = state.godMode;
    vm.allowMultipleInEdges = state.allowMultipleInEdges;
    vm.graph = state.graph;
    vm.code = state.code;
    setGraph();
});
if (vm.code != "") {
    vm.graph = "custom";
}
setGraph();
