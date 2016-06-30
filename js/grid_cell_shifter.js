var GridCellShifter = function(){

  var currentChangeMatrix = null;
  var size = 4;

  function buildCurrentChangeMatrix(){
    currentChangeMatrix = [];
    for (var x = 0; x < 4; x++) {
        currentChangeMatrix.push([]);
      for (var y = 0; y < 4; y++) {
          currentChangeMatrix[x].push(0);
      }
    }
  }

  function clearCurrentChangeMatrix(){
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 4; y++) {
          currentChangeMatrix[x][y] = 0;
      }
    }
  }



  this.moveLeft = function (cells) {

     buildCurrentChangeMatrix();
     //console.log(currentChangeMatrix);
     //console.log(cells);
     var moved = false;
     var score = 0;
     var won = 0;
     for (var row = 0; row < size; row++) {
         for (var col = 1; col < size; col++) {
             var k = col;
             while (k > 0) {
                 if (!currentChangeMatrix[row][k-1] && cells[row][k] != null &&
                     cells[row][k-1] != null &&
                     cells[row][k].value == cells[row][k-1].value) {
                     cells[row][k-1].value += cells[row][k].value;
                     //score += cells[k - 1][col].value;
                     //won = cells[k - 1][col].value >= 2048 ? true : false;
                     cells[row][k] = null;
                     currentChangeMatrix[row][k-1] = 1;
                     moved = true;
                     break;
                 }
                 else if (cells[row][k] != null && cells[row][k-1] == null) {
                     cells[row][k-1] = new Tile({x: row, y: k-1}, cells[row][k].value);
                     cells[row][k] = null;
                     moved = true;
                     k--;
                 }
                 else {
                     break;
                 }
             }
         }
     }
     //console.log(cells);
     clearCurrentChangeMatrix();
     return {moved: moved, score: score, won: won};

  };

  this.moveRight = function (cells) {
      //console.log(this.currentChangeMatrix);
      //console.log(this.cells);
      buildCurrentChangeMatrix();
      var moved = false;
      var score = 0;
      var won = 0;
      for (var row = 0; row < size; row++) {
          for (var col = size - 2; col >= 0; col--) {
              var k = col;
              while (k < size - 1) {
                  if (!currentChangeMatrix[row][k + 1] && cells[row][k] != null &&
                      cells[row][k + 1] != null &&
                      cells[row][k].value == cells[row][k + 1].value) {
                      cells[row][k + 1].value += cells[row][k].value;
                      //score += this.cells[row][k + 1].value;
                      //won = this.cells[row][k + 1].value >= 2048 ? true : false;
                      cells[row][k] = null;
                      currentChangeMatrix[row][k + 1] = 1;
                      //console.log("Row " + row + "Col:" + col);
                      moved = true;
                      break;
                  }
                  else if (cells[row][k] != null && cells[row][k + 1] == null) {
                      cells[row][k + 1] = new Tile({x: row, y: k + 1}, cells[row][k].value);
                      cells[row][k] = null;
                      moved = true;
                      //console.log("Row " + row + "Col:" + col);
                      k++;
                  }
                  else {
                      break;
                  }
              }
          }
      }
      //console.log(cells);
      clearCurrentChangeMatrix();
      return {moved: moved, score: score, won: won};
  };


  this.moveUp = function (cells) {
      //console.log(this.currentChangeMatrix);
      buildCurrentChangeMatrix();
      var moved = false;
      var score = 0;
      var won = 0;
      for (var col = 0; col < size; col++) {
          for (var row = 1; row < size; row++) {
              var k = row;
              while (k > 0) {
                  if (!currentChangeMatrix[k - 1][col] && cells[k][col] != null &&
                      cells[k - 1][col] != null &&
                      cells[k][col].value == cells[k - 1][col].value) {
                      cells[k - 1][col].value += cells[k][col].value;
                      //score += cells[k - 1][col].value;
                      //won = cells[k - 1][col].value >= 2048 ? true : false;
                      cells[k][col] = null;
                      currentChangeMatrix[k - 1][col] = 1;
                      moved = true;
                      break;
                  }
                  else if (cells[k][col] != null && cells[k - 1][col] == null) {
                      cells[k - 1][col] = new Tile({x: k - 1, y: col}, cells[k][col].value);
                      cells[k][col] = null;
                      moved = true;
                      k--;
                  }
                  else {
                      break;
                  }
              }
          }
      }
      clearCurrentChangeMatrix();
      return {moved: moved, score: score, won: won};
  };

  this.moveDown = function (cells) {
      //console.log(this.currentChangeMatrix);
      buildCurrentChangeMatrix();
      var moved = false;
      var score = 0;
      var won = 0;
      for (var col = 0; col < size; col++) {
          for (var row = size - 2; row >= 0; row--) {
              var k = row;
              while (k < size - 1) {
                  if (!currentChangeMatrix[k + 1][col] && cells[k][col] != null &&
                      cells[k + 1][col] != null &&
                      cells[k][col].value == cells[k + 1][col].value) {
                      cells[k + 1][col].value += cells[k][col].value;
                      //score += cells[k + 1][col].value;
                      //won = this.cells[k + 1][col].value >= 2048 ? true : false;
                      cells[k][col] = null;
                      currentChangeMatrix[k + 1][col] = 1;
                      moved = true;
                      break;
                  }
                  else if (cells[k][col] != null && cells[k + 1][col] == null) {
                      cells[k + 1][col] = new Tile({x: k + 1, y: col}, cells[k][col].value);
                      cells[k][col] = null;
                      moved = true;
                      k++;
                  }
                  else {
                      break;
                  }
              }
          }
      }
      clearCurrentChangeMatrix();
      return {moved: moved, score: score, won: won};
  };
}
