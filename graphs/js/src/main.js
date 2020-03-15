"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let mainCanvas = document.querySelector("#mainCanvas");
let context = mainCanvas.getContext("2d");
let statusSpan = document.querySelector("#status");
let godModeCheckbox = document.querySelector("#godModeCheckbox");
let codeForm = document.querySelector("#codeForm");
let graphSelect = document.querySelector("#graphSelect");
let customCodeInput = document.querySelector("#customCode");
let invalidCodeFeedback = document.querySelector("#invalidCodeFeedback");
let codeSubmit = document.querySelector("#codeSubmit");
let roomOuterSize = 100;
let edgeLength = 16;
let roomInnerSize = roomOuterSize - edgeLength;
let rooms = [];
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
    let leftToFind = rooms.filter(r => !r.visited);
    statusSpan.innerText = leftToFind.length === 0 ? "Congratulations! You won!" : `${leftToFind.length} rooms left to find: ${leftToFind.join(", ")}`;
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
    rooms = [];
    for (let i = 1; i <= numRooms; i++) {
        rooms.push(new Room(i));
    }
    for (let c of connections) {
        let r = rooms[c.s - 1].connect(c.sDir, rooms[c.t - 1], c.tDir, c.flip);
        if (!r.success) {
            throw r.error;
        }
    }
    roomView = new RoomView(rooms[0]);
    roomView.setVisited(true);
    if (godModeCheckbox.checked) {
        rooms.forEach(r => r.visited = true);
    }
    render();
}
function resetWithCode(str) {
    rooms = [new Room(1)];
    let cList = Connection.parseMany(str, rooms);
    Connection.execute(cList);
    roomView = new RoomView(rooms[0]);
    roomView.setVisited(true);
    if (godModeCheckbox.checked) {
        rooms.forEach(r => r.visited = true);
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
    rooms = [];
    for (let i = 1; i <= 12; i++) {
        rooms.push(new Room(i));
    }
    for (let r = 0; r < rooms.length; r++) {
        let j = r + 1;
        for (let i = 0; i < 4; i++) {
            rooms[r].connectByTransitionFunction(i, rooms[j++]);
        }
    }
    roomView = new RoomView(rooms[0]);
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
    rooms = [];
    for (let i = 1; i <= 50; i++) {
        let room = new Room(i);
        if (i >= Room.colors.length)
            room.color = getRandomColor();
        rooms.push(room);
    }
    for (let r = 0; r < rooms.length; r++) {
        let j = r + 1;
        for (let i = 0; i < 4; i++) {
            let other = rooms[Math.floor(Math.random() * rooms.length)];
            while (other === rooms[r]) {
                other = rooms[Math.floor(Math.random() * rooms.length)];
            }
            rooms[r].connectByTransitionFunction(i, other);
        }
    }
    roomView = new RoomView(rooms[0]);
    roomView.setVisited(true);
    if (godModeCheckbox.checked) {
        rooms.forEach(r => r.visited = true);
    }
    render();
}
function resetCustom() {
    try {
        resetWithCode(customCodeInput.value);
        customCodeInput.setCustomValidity("");
        graphSelect.value = "custom";
        return true;
    }
    catch (ex) {
        customCodeInput.setCustomValidity(ex);
        invalidCodeFeedback.innerText = ex;
        // customCodeInput.classList.add("is-invalid");
    }
    return false;
}
function setGraph(name) {
    switch (name) {
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
    history.replaceState({ graph: name }, "", `?graph=${name}`);
}
// Event listeners
graphSelect.addEventListener("change", () => {
    codeForm.classList.remove("was-validated");
    let code = graphSelect.selectedOptions[0].getAttribute("data-code");
    if (code != null) {
        resetWithCode(code);
        history.replaceState({ graph: graphSelect.value }, "", `?graph=${graphSelect.value}`);
    }
    else {
        setGraph(graphSelect.value);
    }
});
customCodeInput.addEventListener("input", e => {
    customCodeInput.setCustomValidity("");
    codeForm.classList.remove("was-validated");
    invalidCodeFeedback.innerText = "Invalid format";
});
document.querySelector("#codeForm").addEventListener("submit", () => {
    if (resetCustom()) {
        history.pushState({ code: customCodeInput.value }, "", "?code=" + encodeURIComponent(customCodeInput.value).replace(/%20/g, "+"));
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
    let state = e.state;
    if (state.graph != null) {
        graphSelect.value = state.graph;
        setGraph(state.graph);
    }
    else if (state.code != null) {
        customCodeInput.value = state.code;
        resetCustom();
    }
    else {
        resetToMobiusStrip();
    }
});
// Check url query string
let u = new URLSearchParams(location.search);
if (u.get("bidir") === "0") {
    Room.enforceBidirectional = false;
}
if (u.get("godmode") != null) {
    godModeCheckbox.checked = true;
}
let graphParam = u.get("graph");
if (graphParam != null && document.querySelector(`#graphSelect option[value=${graphParam}]`) != null) {
    graphSelect.value = graphParam;
    setGraph(graphParam);
}
else if (u.has("code")) {
    customCodeInput.value = u.get("code");
    resetCustom();
}
else {
    resetToMobiusStrip();
}
// let vm = new Vue({
//     el: "#app",
//     data: {
//         godMode: true
//     }
// });
