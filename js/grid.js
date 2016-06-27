function Grid(size, previousState) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
}


Grid.prototype.clone = function () {
    var cloneGrid = new Grid();
    cloneGrid.size = this.size;
    cloneGrid.cells = [];
    for (var i = 0; i < cloneGrid.size; i++) {
        cloneGrid.cells[i] = [];
        for (var j = 0; j < cloneGrid.size; j++) {
            cloneGrid.cells[i].push(this.cells[i][j]);
        }
    }
    return cloneGrid;
};

// Build a grid of the specified size
Grid.prototype.empty = function () {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
        var row = cells[x] = [];

        for (var y = 0; y < this.size; y++) {
            row.push(null);
        }
    }
    //console.log(cells);
    return cells;
};

Grid.prototype.fromState = function (state) {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
        var row = cells[x] = [];

        for (var y = 0; y < this.size; y++) {
            var tile = state[x][y];
            row.push(tile ? new Tile(tile.position, tile.value) : null);
        }
    }
    return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
    var cells = this.availableCells();
    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

Grid.prototype.availableCells = function () {
    var cells = [];

    this.eachCell(function (x, y, tile) {
        if (!tile) {
            cells.push({x: x, y: y});
        }
    });

    return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

Grid.prototype.showCells = function () {
    for (var i = 0; i < this.size; i++) {
        console.log(this.cells[i]);
    }
};


// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {

    this.cells[tile.x][tile.y] = tile;


};

Grid.prototype.removeTile = function (tile) {
    this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x < this.size &&
        position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
    var cellState = [];

    for (var x = 0; x < this.size; x++) {
        var row = cellState[x] = [];

        for (var y = 0; y < this.size; y++) {
            row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
        }
    }

    return {
        size: this.size,
        cells: cellState
    };
};


Grid.prototype.getVector = function (direction) {
    // Vectors representing tile movement
    var map = {
        0: {x: 0, y: -1}, // Up
        1: {x: 1, y: 0},  // Right
        2: {x: 0, y: 1},  // Down
        3: {x: -1, y: 0}   // Left
    };

    return map[direction];
};


// Build a list of positions to traverse in the right order
Grid.prototype.buildTraversals = function (vector) {
    var traversals = {x: [], y: []};

    for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
};


Grid.prototype.prepareTiles = function () {
    this.eachCell(function (x, y, tile) {
        if (tile) {
            tile.mergedFrom = null;
            tile.savePosition();
        }
    });
};

Grid.prototype.findFarthestPosition = function (cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
        previous = cell;
        cell = {x: previous.x + vector.x, y: previous.y + vector.y};
    } while (this.withinBounds(cell) &&
    this.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell // Used to check if a merge is required
    };
};

Grid.prototype.currentChangeMatrix = [];
for (var x = 0; x < 4; x++) {
    Grid.prototype.currentChangeMatrix.push([]);
    for (var y = 0; y < 4; y++) {
        Grid.prototype.currentChangeMatrix[x].push(0);
    }
}

Grid.prototype.moveUp = function () {
    var moved = false;
    var score = 0;
    var won = 0;
    for (var col = 0; col < this.size; col++) {
        for (var row = 1; row < this.size; row++) {
            var k = row;
            while (k > 0) {
                if (!this.currentChangeMatrix[k - 1][col] && this.cells[k][col] != null &&
                    this.cells[k - 1][col] != null &&
                    this.cellContent(this.cells[k][col]) == this.cellContent(this.cells[k - 1][col])) {
                    this.cells[k - 1][col].value += this.cells[k][col].value;
                    score += this.cells[k - 1][col].value;
                    won = this.cells[k - 1][col].value >= 2048 ? true : false;
                    this.cells[k][col] = null;
                    this.currentChangeMatrix[k - 1][col] = 1;
                    moved = true;
                    break;
                }
                else if (this.cells[k][col] != null && this.cells[k - 1][col] == null) {
                    this.cells[k - 1][col] = new Tile({x: k - 1, y: col}, this.cells[k][col].value);
                    this.cells[k][col] = null;
                    moved = true;
                    k--;
                }
                else {
                    break;
                }
            }
        }
    }
    return {moved: moved, score: score, won: won};
};

Grid.prototype.moveDown = function () {
    var moved = false;
    var score = 0;
    var won = 0;
    for (var col = 0; col < this.size; col++) {
        for (var row = this.size - 2; row >= 0; row--) {
            var k = row;
            while (k < this.size - 1) {
                if (!this.currentChangeMatrix[k + 1][col] && this.cells[k][col] != null &&
                    this.cells[k + 1][col] != null &&
                    this.cellContent(this.cells[k][col]) == this.cellContent(this.cells[k + 1][col])) {
                    this.cells[k + 1][col].value += this.cells[k][col].value;
                    score += this.cells[k + 1][col].value;
                    won = this.cells[k + 1][col].value >= 2048 ? true : false;
                    this.cells[k][col] = null;
                    this.currentChangeMatrix[k + 1][col] = 1;
                    moved = true;
                    break;
                }
                else if (this.cells[k][col] != null && this.cells[k + 1][col] == null) {
                    this.cells[k + 1][col] = new Tile({x: k + 1, y: col}, this.cells[k][col].value);
                    this.cells[k][col] = null;
                    moved = true;
                    k++;
                }
                else {
                    break;
                }
            }
        }
    }
    return {moved: moved, score: score, won: won};
};

Grid.prototype.moveLeft = function () {
    var moved = false;
    var score = 0;
    var won = 0;
    for (var row = 0; row < this.size; row++) {
        for (var col = 1; col < this.size; col++) {
            var k = col;
            while (k > 0) {
                if (!this.currentChangeMatrix[row][k - 1] && this.cells[row][k] != null &&
                    this.cells[row][k - 1] != null &&
                    this.cellContent(this.cells[row][k]) == this.cellContent(this.cells[row][k - 1])) {
                    this.cells[row][k - 1].value += this.cells[row][k].value;
                    score += this.cells[row][k - 1].value;
                    won = this.cells[row][k - 1].value >= 2048 ? true : false;
                    this.cells[row][k] = null;
                    this.currentChangeMatrix[row][k - 1] = 1;
                    moved = true;
                    break;
                }
                else if (this.cells[row][k] != null && this.cells[row][k - 1] == null) {
                    this.cells[row][k - 1] = new Tile({x: row, y: k - 1}, this.cells[row][k].value);
                    this.cells[row][k] = null;
                    moved = true;
                    k--;
                }
                else {
                    break;
                }
            }
        }
    }
    return {moved: moved, score: score, won: won};
};

Grid.prototype.moveRight = function () {
    var moved = false;
    var score = 0;
    var won = 0;
    for (var row = 0; row < this.size; row++) {
        for (var col = this.size - 2; col >= 0; col--) {
            var k = col;
            while (k < this.size - 1) {
                if (!this.currentChangeMatrix[row][k + 1] && this.cells[row][k] != null &&
                    this.cells[row][k + 1] != null &&
                    this.cellContent(this.cells[row][k]) == this.cellContent(this.cells[row][k + 1])) {
                    this.cells[row][k + 1].value += this.cells[row][k].value;
                    score += this.cells[row][k + 1].value;
                    won = this.cells[row][k + 1].value >= 2048 ? true : false;
                    this.cells[row][k] = null;
                    this.currentChangeMatrix[row][k + 1] = 1;
                    moved = true;
                    break;
                }
                else if (this.cells[row][k] != null && this.cells[row][k + 1] == null) {
                    this.cells[row][k + 1] = new Tile({x: row, y: k + 1}, this.cells[row][k].value);
                    this.cells[row][k] = null;
                    moved = true;
                    k++;
                }
                else {
                    break;
                }
            }
        }
    }
    return {moved: moved, score: score, won: won};
};
