var GridScorer = function (cells) {
    this.cells = cells;
    this.size = 4;

//find max valued tile in the cell
    this.getGridMaxTile = function () {
        var maxTile = {value: 0, x: null, y: null};
        for (var row = 0; row < this.size; row++) {
            for (var col = 0; col < this.size; col++) {
                if (this.cells[row][col] != null && this.cells[row][col].value >= maxTile.value) {
                    maxTile = {value: this.cells[row][col].value, x: row, y: col};
                }
            }
        }
        maxTile.value = Math.log(maxTile.value)/Math.log(2);
        //console.log("Max value:" + maxTile.value);
        return maxTile;
    };

    this.getMonotonicityScore = function () {
        var values = [0, 0, 0, 0];
        //up to down increasing order
        for (var col = 0; col < this.size; col++) {
            var currentValue = this.cells[0][col] != null ? Math.log(this.cells[0][col].value) / Math.log(2) : 0;
            for (var row = 1; row < this.size; row++) {
                if ((row == this.size-1 && this.cells[row][col] == null) || this.cells[row][col] != null) {
                    var nextValue = this.cells[row][col] != null ? Math.log(this.cells[row][col].value) / Math.log(2) : 0;
                  if (currentValue > nextValue) {
                      values[0] += nextValue -currentValue;
                  }
                  else {
                      values[1] += currentValue - nextValue;
                  }
                  currentValue = nextValue;
                }
            }
        }

        //left to right increasing order
        for (var row = 0; row < this.size; row++) {
            var currentValue = this.cells[row][0] != null ? Math.log(this.cells[row][0].value) / Math.log(2) : 0;
            for (var col = 1; col < this.size; col++) {
                if ((col == this.size -1 && this.cells[row][col] == null) || this.cells[row][col] != null) {
                  var nextValue = this.cells[row][col] != null ? Math.log(this.cells[row][col].value) / Math.log(2) : 0;
                  if (currentValue > nextValue) {
                      values[2] += nextValue - currentValue;
                  }
                  else {
                      values[3] += currentValue - nextValue;
                  }
                  currentValue = nextValue;
                }
            }
        }
        var monotonicity = Math.max(values[0], values[1]) + Math.max(values[2], values[3]);
        //console.log("monotonicity" +  monotonicity);
        return monotonicity;
    };

    this.getSmoothness = function () {
        var smoothness = 0;
        //row wise smoothness measure
        for(var i = 0; i < this.size; i++){
          for(var j = 0; j < this.size-1; j++){
            var currentValue = this.cells[i][j] != null ? Math.log(this.cells[i][j].value)/Math.log(2) : 0;
            var nextValue = this.cells[i][j+1] != null ?  Math.log(this.cells[i][j+1].value)/Math.log(2) : 0;
            smoothness -= Math.abs(currentValue - nextValue);
          }
        }
        //column wise smoothness measure
          for(var i = 0; i < this.size-1; i++){
            for(var j = 0; j < this.size; j++){
            var currentValue = this.cells[i][j] != null ? Math.log(this.cells[i][j].value)/Math.log(2) : 0;
            var nextValue = this.cells[i+1][j] != null ? Math.log(this.cells[i+1][j].value)/Math.log(2) : 0;
            smoothness -= Math.abs(currentValue - nextValue);
          }
        }
        //console.log("smoothness" + smoothness);
        return smoothness;
    };

    this.getMonotonicityScore2 = function(){
      var degreeOfMonotonicity = 0;
      //right to left decreasing order
      for(var row = this.size-1; row >= 0; row--){
        var current = this.cells[row][this.size-1] != null ? this.cells[row][this.size-1].value : 0;
        var sum = 0;
        for(var col = this.size-2;  col >= 0; col--){
            var next = this.cells[row][col] != null ? this.cells[row][col].value : 0;
            if(!(current >= next)){
              sum--;
            }
        }
        sum *= row+1;
        degreeOfMonotonicity = sum;
      }

      //down to up decreasing order
      for(var col = this.size-1; col >= 0; col--){
        var current = this.cells[this.size-1][col] != null ? this.cells[this.size-1][col].value : 0;
        for(var row = this.size-2; row >= 0; row --){
          var next = this.cells[row][col] != null ? this.cells[row][col].value : 0;
          if(!(current >= next)){
            degreeOfMonotonicity--;
          }
        }
      }
      return degreeOfMonotonicity;
    }


};
