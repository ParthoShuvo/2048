/**
 * Created by shuvojit on 6/25/16.
 */
var PlayerAI = function () {
    this.initialDepth = 0;
    this.finalDepth = 1;
    var cellShifter = new GridCellShifter();
    var currentChildNodes =  null;
    var flag = true;

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


    /**
     * set CurrentGrid
     * @param grid
     */
    this.setCurrentGrid = function (grid) {
        //console.log(grid.cells);
        this.currentNode = new GameNode(this.initialDepth, grid, 'max', null);
    };

    /***
     * get AI player direction
     * @returns {number}
     */
    this.getAIPlayerDirection = function () {
        //getChildNodes(this.currentNode, 'max');
        //console.log(getHeuristicValue(this.currentNode.grid));
        alphaBetaPruning(this.currentNode, 'max');
        var direction = null;
        console.log("Best Value: " + this.currentNode.value);
        //console.log(this.currentNode.grid.showCells());
        for(var i = 0; i < currentChildNodes.length; i++){
              /*console.log(currentChildNodes[i].grid.showCells());
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
              emptyWeight * countOfEmptyCells + monotonicityWeight * monotonicity +
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
            if (res != null && res.moved) {
                //console.log("child node");
                //console.log(direction);
                //console.log(newGrid.showCells());
                childNodes.push(new GameNode(parentNode.depth + 1, newGrid, 'min', direction));

            }
        }
        return childNodes;
    };

//insert 2 having 90% probability or 4 having 10% probability
    function getMinParentChildNodes(parentNode) {
        var childNodes = [];
        //console.log("min");
        var freeCells = parentNode.grid.availableCells();
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
            var heuristicVal = getHeuristicValue(gameNode.grid);
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
        //recursive case
        if (mode == 'max') {
            //console.log("Parent node: Max");
            //console.log(gameNode.grid.cells);
            //console.log("Node value:" + gameNode.value);
            //console.log("Alpha value" + gameNode.alphaValue);
            //console.log(s"Beta value" + gameNode.betaValue);
            var maxChildNodes = getChildNodes(gameNode, mode);
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
            var minChildNodes = getChildNodes(gameNode, mode);
            if (minChildNodes != null && minChildNodes.length > 0) {
                for(var i = 0; i < minChildNodes.length; i++) {
                    var childNode = minChildNodes[i];
                    childNode.setAlphaValue(gameNode.alphaValue);
                    childNode.setBetaValue(gameNode.betaValue);
                    var val = alphaBetaPruning(childNode, 'max');
                    gameNode.setNodeValue(val);
                    gameNode.setBetaValue(val);
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
