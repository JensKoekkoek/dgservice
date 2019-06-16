var N = 5;
var $board = $("#board");
var $squares = [];
var vector = [];
var offsets = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

var lightsOutMatrix = [[1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1]];

var pseudoinverse = [[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1], [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1], [0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1], [0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0], [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0], [0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0], [0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1], [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1], [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0], [0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0], [0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0]];

// All the vectors in the nullspace of the Lights Out matrix, or that flip all the tiles.
var nullOrFlipAllVectors = [[[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]], [[1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 0, 0, 0, 0], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1]], [[0, 1, 1, 1, 0], [1, 0, 1, 0, 1], [1, 1, 0, 1, 1], [1, 0, 1, 0, 1], [0, 1, 1, 1, 0]], [[1, 1, 0, 1, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 1]], [[0, 1, 1, 0, 1], [0, 1, 1, 1, 0], [0, 0, 1, 1, 1], [1, 1, 0, 1, 1], [1, 1, 0, 0, 0]], [[1, 1, 0, 0, 0], [1, 1, 0, 1, 1], [0, 0, 1, 1, 1], [0, 1, 1, 1, 0], [0, 1, 1, 0, 1]], [[0, 0, 0, 1, 1], [1, 1, 0, 1, 1], [1, 1, 1, 0, 0], [0, 1, 1, 1, 0], [1, 0, 1, 1, 0]], [[1, 0, 1, 1, 0], [0, 1, 1, 1, 0], [1, 1, 1, 0, 0], [1, 1, 0, 1, 1], [0, 0, 0, 1, 1]]];

function init() {
    for (var y = 0; y < N; y++) {
        vector[y] = [];
        $squares[y] = [];
        var $tr = $("<tr/>");
        for (var x = 0; x < N; x++) {
            vector[y][x] = 0;
            $squares[y][x] = $("<td/>").data({ x, y });
            $tr.append($squares[y][x]);
        }
        $("#board").append($tr);
    }
}

function isInRange(value) {
    return value >= 0 && value < N;
}

function flip(x, y) {
    if (vector[y][x] === 1) {
        vector[y][x] = 0;
        $squares[y][x].removeClass("on");
    } else {
        vector[y][x] = 1;
        $squares[y][x].addClass("on");
    }
}

function touch(x, y) {
    $squares[y][x].toggleClass("one");
    offsets.forEach(function (offset) {
        var xi = x + offset[0], yi = y + offset[1];
        if (isInRange(xi) && isInRange(yi)) {
            flip(xi, yi);
        }
    });
}

// Tricky point: vector is actually a square array, but we treat it as a column vector in multiplying.
// Also, this is done mod 2.
function multiply(matrix, vector) {
    var n = vector.length;

    var result = [];
    for (var y = 0; y < n; y++) {
        result[y] = [];
        for (var x = 0; x < n; x++) {
            result[y][x] = 0;
        }
    }
    for (var i = 0; i < n * n; i++) {
        var x = i % n, y = Math.floor(i / n);
        for (var j = 0; j < n * n; j++) {
            result[y][x] += matrix[i][j] * vector[Math.floor(j / n)][j % n];
            result[y][x] %= 2;
        }
    }
    return result;
}

function add(vector1, vector2) {
    var result = [];
    for (var y = 0; y < N; y++) {
        result[y] = [];
        for (var x = 0; x < N; x++) {
            result[y][x] = (vector1[y][x] + vector2[y][x]) % 2;
        }
    }
    return result;
}

function totalOnes(vector) {
    var result = 0;
    for (var y = 0; y < N; y++) {
        for (var x = 0; x < N; x++) {
            result += vector[y][x];
        }
    }
    return result;
}

function equal(vector1, vector2) {
    for (var y = 0; y < N; y++) {
        for (var x = 0; x < N; x++) {
            if (vector1[y][x] !== vector2[y][x]) {
                return false;
            }
        }
    }
    return true;
}

function isSolvable(vector) {
    return equal(multiply(lightsOutMatrix, multiply(pseudoinverse, vector)), vector);
}

function getAllSolutions(vector) {
    // Multiply by solution matrix
    var solVector = multiply(pseudoinverse, vector);
    return nullOrFlipAllVectors.map(function (v) { return add(v, solVector); });
}

function updateSolvable() {
    var solvable = isSolvable(vector);
    $("#solve, #unsolve").prop("disabled", !solvable);
    $("#solve").text(solvable ? "Solve" : "Unsolvable");
}

init();

$("#board").on("mousedown", "td", function (e) {
    e.preventDefault();
    var $td = $(e.target);
    var x = $td.data("x"), y = $td.data("y");

    if (e.button === 0) {
        flip(x, y);
    } else if (e.button === 2) {
        touch(x, y);
    }

    updateSolvable();
})

$("#board").contextmenu(function (e) { e.preventDefault(); });

$("#solve").click(function () {
    var minSol = getAllSolutions(vector)
        .map(function (v) { return { vector: v, total: totalOnes(v) }; })
        .reduce(function (prev, curr) { return prev.total < curr.total ? prev : curr });

    for (var y = 0; y < N; y++) {
        for (var x = 0; x < N; x++) {
            if (minSol.vector[y][x] === 1) {
                touch(x, y);
            }
        }
    }
});

$("#unsolve").click(function () {
    for (var y = 0; y < N; y++) {
        for (var x = 0; x < N; x++) {
            if ($squares[y][x].hasClass("one")) {
                touch(x, y);
            }
        }
    }
});

$("#reset").click(function () {
    for (var y = 0; y < N; y++) {
        for (var x = 0; x < N; x++) {
            vector[y][x] = 0;
            $squares[y][x].removeClass("on").removeClass("one");
        }
    }
    updateSolvable();
});
