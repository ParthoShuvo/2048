var GridScorer = function(grid){
  this.grid = grid;

//find max valued tile in the cell
  this.getGridMaxTile = function(){
    var maxTile = {value: 0, x: null, y: null};
    for(var row = 0;row < this.grid.size; row++){
      for(var col = 0; col < this.grid.size; col++){
        if(this.grid.cells[row][col] != null && this.grid.cells[row][col].value > maxTile.value){
          maxTile = {value: this.grid.cells[row][col].value, x: row, y: col};
        }
      }
    }
    return maxTile;
  }

  this.getMonotonicityScore = function(){
    var downToUpMonotonicity = 0;
    var rightToLeftMonotonicity = 0;
    //down to up decreasing order
    for(var col = this.grid.size - 1; col >= 0; col--){
      var currentValue = this.grid.cells[this.grid.size - 1][col] != null ? Math.log(this.grid.cells[this.grid.size - 1][col].value) : 0;
      for(var row = this.grid.size-2; row >= 0; row--){
        if(this.grid.cells[row][col] == null){
          if(row == 0){
            downToUpMonotonicity += currentValue;
          }
          continue;
        }
        else{
          var nextValue = Math.log(this.grid.cells[row][col].value);
          if(currentValue > nextValue){
              downToUpMonotonicity += currentValue - nextValue;
          }
          else{
              downToUpMonotonicity += currentValue - nextValue;
          }
          currentValue = nextValue;
          continue;
        }
      }
    }

    //right to left decreasing order
    for(var row = this.grid.size - 1; row >= 0; row--){
      var currentValue = this.grid.cells[row][this.grid.size - 1] != null ? Math.log(this.grid.cells[row][this.grid.size - 1].value) : 0;
      for(var col = this.grid.size-2; col >= 0; col--){
        if(this.grid.cells[row][col] == null){
          if(row == 0){
            rightToLeftMonotonicity += currentValue;
          }
          continue;
        }
        else{
          var nextValue = Math.log(this.grid.cells[row][col].value);
          if(currentValue > nextValue){
              rightToLeftMonotonicity += currentValue - nextValue;
          }
          else{
              rightToLeftMonotonicity += nextValue - currentValue;
          }
          currentValue = nextValue;
          continue;
        }
      }
    }
    return downToUpMonotonicity + rightToLeftMonotonicity;
  };

  this.getSmoothness = function(){
    var smoothnessCount = 0;
    for(var row = this.grid.size-1; row >= 0; row--){
      for(var col = this.grid.size-1; col >= 0; col--){
        if((col - 1) > 0 && this.grid.cells[row][col] == this.grid.cells[row][col - 1]){
          smoothnessCount++;
        }
        if((row - 1) > 0 && this.grid.cells[row][col] == this.grid.cells[row - 1][col - 1]){
          smoothnessCount++;
        }
      }
    }
    return smoothnessCount? Math.log(smoothnessCount) : 0;
  };



};
