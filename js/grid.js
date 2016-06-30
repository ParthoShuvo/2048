function Grid(size, previousState) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
}




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
        var elements = '';
        for(var j = 0; j < this.size; j++){
          elements += this.cells[i][j] != null ? this.cells[i][j].value : 0;
          elements += " ";
        }
        console.log(elements);
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


Grid.prototype.isWin = function() {
  var self = this;
  for (var i=0; i<4; i++) {
    for (var j=0; j<4; j++) {
      if (this.cells[i][j] != null) {
        if (this.cells[i][j].value == 2048) {
          return true;
        }
      }
    }
  }
  return false;
}
