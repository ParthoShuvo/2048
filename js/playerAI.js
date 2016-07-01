/**
 * Created by shuvojit on 6/25/16.
 */
var PlayerAI = function () {
    this.initialDepth = 0;
    this.finalDepth = 1;
    var cellShifter = new GridCellShifter();
    var currentChildNodes =  null;
    var flag = true;
    var maxTile = null;

    /**
     * heuristic value weight
     */
     var smoothWeight = 0.7, monotonicityWeight  = 1.0, emptyWeight  = 2.7,
        maxWeight    = 1.0;

    /**
     * set Starting depth
     * @param depth
     */
    this.setStartingDepth = function (depth) {
        this.initialDepth = depth;
    };

    /***
     * set Ending Depth
     * @param depth
     */
    this.setEndingDepth = function (depth) {
        this.finalDepth = depth;

    };


    /**ar newMaxTile = new GridScorer(newGameNode.grid.cells).getGridMaxTile();
     * set CurrentGrid
     * @param grid
     */
    this.setCurrentGrid = function (grid) {
        //console.log(grid.cells);
        this.currentNode = new GameNode(this.initialDepth, grid, 'max', null);
    };

    function removeNodeElement(){
      if(maxTile.x == 3 && maxTile.y == 3 && currentChildNodes[0].direction == 0){
        //var newMaxTile = new GridScorer(currentChildNodes[0].grid.cells).getGridMaxTile();
        if(currentChildNodes[0].grid.cells[3][3] == null){
          currentChildNodes.shift();
        }
      }
    }

    /***
     * get AI player direction
     * @returns {number}
     */
    this.getAIPlayerDirection = function () {
        maxTile = new GridScorer(this.currentNode.grid.cells).getGridMaxTile();
        //getChildNodes(this.currentNode, 'max');
        //console.log(getHeuristicValue(this.currentNode.grid));
        alphaBetaPruning(this.currentNode, 'max');
        var direction = null;
        //console.log(this.currentNode);
        console.log("Best Value: " + this.currentNode.value);
        //console.log(this.currentNode.grid.showCells());
        for(var i = 0; i < currentChildNodes.length; i++){
          /*console.log(currentChildNodes[i]);
              console.log(currentChildNodes[i].grid.showCells());
              console.log("Direction: " + currentChildNodes[i].direction + " value: " +currentChildNodes[i].value);*/
            if(currentChildNodes[i].value == this.currentNode.value){
                direction =  currentChildNodes[i].direction;
                break;
              }

        }
        currentChildNodes = null;
        console.log(direction);
        return direction;
    };

/**
  calculate heuristic value
**/
    function getHeuristicValue(grid) {
        var gridScorer = new GridScorer(grid.cells);
        var gridMaxCell = gridScorer.getGridMaxTile();
        var countOfEmptyCells = grid.cellsAvailable() ? Math.log(grid.availableCells().length) : 0;
        var monotonicity = gridScorer.getMonotonicityScore();
        var smoothness = gridScorer.getSmoothness();
        var monotonicity2 = gridScorer.getMonotonicityScore2();
        var rightMostCornerMaxValue = 0;
        if(gridMaxCell.x == 3 && gridMaxCell.y == 3){
          rightMostCornerMaxValue = Math.log(gridMaxCell.value + grid.cells[3][2] + grid.cells[3][1] + grid.cells[3][0]);
        }
        var heuristicVal = maxWeight * gridMaxCell.value +
              emptyWeight * countOfEmptyCells + monotonicityWeight * monotonicity2 +
              smoothWeight * smoothness;
        return heuristicVal;

    }




    function clone(currentGrid) {
        //console.log(currentGrid.showCells());
        var cloneGrid = new Grid();
        cloneGrid.size = currentGrid.size;
        cloneGrid.cells = [];
        //console.log(cloneGrid.cells);
        for (var i = 0; i < currentGrid.size; i++) {
            cloneGrid.cells.push([]);
            for (var j = 0; j < currentGrid.size; j++) {
                  var cell = currentGrid.cells[i][j]
                  cloneGrid.cells[i].push(cell);
                }
            }
        //console.log(cloneGrid.cells);
        //console.log(cloneGrid.showCells());
        return cloneGrid;
    };

    /**
     get childNodes
     **/
    function getChildNodes(parentNode, mode) {
        var childNodes = [];
        if (mode == 'max') {
            childNodes = getMaxParentChildNodes(parentNode);
            if(flag){
              currentChildNodes = [];
              for(var i = 0; i < childNodes.length; i++){
                var childNode = childNodes[i];
                currentChildNodes.push(childNode);
              }
              flag = false;
            }
        }
        else {
            childNodes = getMinParentChildNodes(parentNode);

        }
        return childNodes;
    };

    //0 for up, 3 for left, 2 for down, 1 for right
    //I escape up move here
    function getMaxParentChildNodes(parentNode) {
        var childNodes = [];
        //console.log("Parent");
        //console.log(parentNode.grid.showCells());
        //console.log("max");
        //var currentMaxTile = new GridScorer(parentNode.grid.cells).getGridMaxTile();
        for (var direction = 0; direction < 3; direction++) {
            var newGrid = _.cloneDeep(parentNode.grid);
            var res = null;
            switch (direction) {
                case 0:
                    res = cellShifter.moveLeft(newGrid.cells);
                    //console.log(newGrid.showCells());
                    break;
                case 1:
                    res = cellShifter.moveDown(newGrid.cells);
                    break;
                case 2:
                    res = cellShifter.moveRight(newGrid.cells);
                    break;
                case 3:
                  res = cellShifter.moveUp(newGrid.cells);
                  break;
                default:
                    break;
            }
            //console.log(currentMaxTile.x  + " " + currentMaxTile.y)
            /*if(direction == 0 && currentMaxTile.x == 3 && currentMaxTile.y == 3
                      && ){
              console.log("checked...................................");
              var bal = newGrid.cells[3][3] != null ? newGrid.cells[3][3].value : 0;
              console.log(bal + " " + parentNode.grid.cells[3][3].value);
              continue;
            }*/
            if (res != null && res.moved) {
                //console.log("child node");
                //console.log(direction);
                //console.log(newGrid.showCells());
                var newGameNode = new GameNode(parentNode.depth + 1, newGrid, 'min', direction);
                var newMaxTile = new GridScorer(newGameNode.grid.cells).getGridMaxTile();
                if(direction == 0 &&  (maxTile.x == 3 && maxTile.y == 3) &&
                      (newMaxTile.x != 3 || newMaxTile.y != 3) && (parentNode.depth + 1) == 1){
                        newGameNode.badMove = true;
                        newGameNode.bonusValue = -1000;
                        //continue;
                }
                /*else if(newMaxTile.x == 3 && newMaxTile.y == 3){
                          newGameNode.bestMove = true;
                          newGameNode.bonusValue = 100;
                          //console.log(newGameNode.grid.showCells());
                          //console.log("check");
                          //console.log(newGameNode.grid.cells[3][3].value);
                      //newGameNode.maxValue = newMaxTile.value;
                }*/
                childNodes.push(newGameNode);


            }
        }
        return childNodes;
    };



//insert 2 having 90% probability or 4 having 10% probability
    function getMinParentChildNodes(parentNode) {
        var childNodes = [];
      //  console.log("min");
        var freeCells = _.cloneDeep(parentNode.grid.availableCells());
        //console.log(freeCells);
        for (var i = 0; i < freeCells.length; i++) {
            //for value 2 tile
            var newGrid = _.cloneDeep(parentNode.grid);
            newGrid.insertTile(new Tile({x: freeCells[i].x, y:freeCells[i].y}, 2));
            //console.log("child node");
            //console.log(newGrid.showCells());
            childNodes.push(new GameNode(parentNode.depth + 1, newGrid, 'max', parentNode.direction));
            //for value 4 tile
            newGrid = _.cloneDeep(parentNode.grid);
            newGrid.insertTile(new Tile({x: freeCells[i].x, y:freeCells[i].y}, 4));
            //console.log("child node");
            //console.log(newGrid.showCells());
            childNodes.push(new GameNode(parentNode.depth + 1, newGrid, 'max', parentNode.direction));
        }
        return childNodes;
    };

//alpha beta pruning algorithm
    function alphaBetaPruning(gameNode, mode) {
        //base case
        if (gameNode.depth == 5) {
            var heuristicVal = getHeuristicValue(gameNode.grid) + gameNode.bonusValue;
            //console.log(gameNode.direction);
            //console.log("child Node");
            //console.log(gameNode.grid.cells);
            gameNode.setNodeValue(heuristicVal);
            if(gameNode.mode == 'max'){
                gameNode.setAlphaValue(heuristicVal);
            }
            else{
                gameNode.setBetaValue(heuristicVal);
            }
            //console.log("Node value:" + gameNode.value);
            //console.log("Alpha value" + gameNode.alphaValue);
            //console.log("Beta value" + gameNode.betaValue);
            return gameNode.value;
        }
        else if(gameNode.mode == 'min'){
          if(gameNode.grid.isWin()){
            gameNode.setNodeValue(10000);
            gameNode.setBetaValue(10000);
            return gameNode.value;
          }
          else if(gameNode.bestMove || gameNode.badMove){
            console.log("terminal Node");
            var heuristicVal = getHeuristicValue(gameNode.grid) + gameNode.bonusValue;
            gameNode.setNodeValue(heuristicVal);
            gameNode.setBetaValue(heuristicVal);
            return gameNode.value;
          }
          /*else if(gameNode.badMove){
            gameNode.setBetaValue(gameNode.value);
            //return gameNode.value;
          }*/

        }

        //recursive case
        if (mode == 'max') {
            //console.log("Parent node: Max");
            //console.log(gameNode.grid.cells);
            //console.log("Node value:" + gameNode.value);
            //console.log("Alpha value" + gameNode.alphaValue);
            //console.log(s"Beta value" + gameNode.betaValue);
            var maxChildNodes = getChildNodes(_.cloneDeep(gameNode), mode);
            //console.log("Max nodes extracting");
            if (maxChildNodes != null && maxChildNodes.length > 0) {
                for (var i = 0; i < maxChildNodes.length; i++) {
                    var childNode = maxChildNodes[i];
                    childNode.setAlphaValue(gameNode.alphaValue);
                    childNode.setBetaValue(gameNode.betaValue);
                    var val = alphaBetaPruning(childNode, 'min');
                    gameNode.setNodeValue(val);
                    gameNode.setAlphaValue(val);
                    //console.log("Parent node");
                    //console.log("Node value:" + gameNode.value);
                    //console.log("Alpha value" + gameNode.alphaValue);
                    //console.log("Beta value" + gameNode.betaValue);
                    if (gameNode.alphaValue >= gameNode.betaValue) {
                        //console.log("alpha cut");
                        break;
                    }
                }
            }
        }
        else if (mode == 'min') {
          //console.log("Parent node: Min");
          //console.log(gameNode.grid.cells);
          //console.log("Node value:" + gameNode.value);
          //console.log("Alpha value" + gameNode.alphaValue);
          //console.log("Beta value" + gameNode.betaValue);
            var minChildNodes = getChildNodes(_.cloneDeep(gameNode), mode);
            if (minChildNodes != null && minChildNodes.length > 0) {
                for(var i = 0; i < minChildNodes.length; i++) {
                    var childNode = minChildNodes[i];
                    childNode.setAlphaValue(gameNode.alphaValue);
                    childNode.setBetaValue(gameNode.betaValue);
                    var val = alphaBetaPruning(childNode, 'max');
                    gameNode.setNodeValue(val);
                    gameNode.setBetaValue(val);
                    /*if(gameNode.value == -32787){
                      console.log("jjj");
                      console.log("depth: " + childNode.depth);
                      console.log(childNode.grid.showCells());
                      console.log(childNode.alphaValue);
                    }*/
                    //console.log("Parent node");
                    //console.log("Node value:" + gameNode.value);
                    //console.log("Alpha value" + gameNode.alphaValue);
                    //console.log("Beta value" + gameNode.betaValue);
                    if (gameNode.alphaValue >= gameNode.betaValue) {
                        //console.log("beta cut");
                        break;
                    }
                }
            }
        }
        return gameNode.value;
    };
};
