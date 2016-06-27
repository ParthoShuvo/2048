/**
 * Created by shuvojit on 6/25/16.
 */
var PlayerAI = function () {
    this.initialDepth = 0;
    this.finalDepth = 1;

    /**
     * heuristic value weight
     */
     var smoothWeight = 0.1,
      monotonicityWeight  = 1.0,
      emptyWeight  = 2.7,
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
        /*getChildNodes(this.currentNode, 'max');*/
        //console.log(getHeuristicValue(this.currentNode.grid));
        alphaBetaPruning(this.currentNode, 'max');
        var direction = this.currentNode.direction;
        console.log(direction);
        return direction;
    };

/**
  calculate heuristic value
**/
    function getHeuristicValue(grid) {
        var gridScorer = new GridScorer(grid);
        var gridMaxCell = gridScorer.getGridMaxTile();
        var countOfEmptyCells = grid.cellsAvailable() ? Math.log(grid.availableCells().length) : 0;
        var monotonicity = gridScorer.getMonotonicityScore();
        var maxValue = gridMaxCell.x == 3 && gridMaxCell.y == 3 ? Math.log(gridMaxCell.value) : 0;
        var smoothness = gridScorer.getSmoothness();
        var heuristicVal = maxWeight * maxValue +
              emptyWeight * countOfEmptyCells + monotonicityWeight * monotonicity +
              smoothWeight * smoothness;
        return Math.round(heuristicVal);

    }

    /**
     get childNodes
     **/
    function getChildNodes(parentNode, mode) {
        var childNodes = null;
        if (mode == 'max') {
            childNodes = getMaxParentChildNodes(parentNode);
        }
        else {
            childNodes = getMinParentChildNodes(parentNode);
        }
        return childNodes;
    };

    //0 for up, 1 for left, 2 for down, 3 for right
    //I escape up move here
    function getMaxParentChildNodes(parentNode) {
        var childNodes = [];
        //console.log("max");
        for (var direction = 1; direction < 4; direction++) {
            var newGrid = parentNode.grid.clone();
            var res = null;
            switch (direction) {
                case 1:
                    res = newGrid.moveLeft();
                    break;
                case 2:
                    res = newGrid.moveDown();
                    break;
                case 3:
                    res = newGrid.moveRight();
                    break;
            }
            if (res.moved) {
                //console.log("child node");
                //console.log(newGrid.cells);
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
            var newGrid = parentNode.grid.clone();
            newGrid.insertTile(new Tile({x: freeCells[i].x, y:freeCells[i].y}, 2));
            //console.log("child node");
            //console.log(newGrid.cells);
            childNodes.push(new GameNode(parentNode.depth + 1, newGrid, 'max', parentNode.direction));
            //for value 4 tile
            newGrid = parentNode.grid.clone();
            newGrid.insertTile(new Tile({x: freeCells[i].x, y:freeCells[i].y}, 4));
            //console.log("child node");
            //console.log(newGrid.cells);
            childNodes.push(new GameNode(parentNode.depth + 1, newGrid, 'max', parentNode.direction));
        }
        return childNodes;
    };

//alpha beta pruning algorithm
    function alphaBetaPruning(gameNode, mode) {
        //base case
        if (gameNode.depth == 5) {
            var heuristicVal = getHeuristicValue(gameNode.grid);
            gameNode.setNodeValue(heuristicVal, gameNode.direction);
            if(gameNode.mode == 'max'){
                gameNode.setAlphaValue(heuristicVal);
            }
            else{
                gameNode.setBetaValue(heuristicVal);
            }
            return gameNode.value;
        }
        //recursive case
        if (mode == 'max') {
            var childNodes = getChildNodes(gameNode, mode);
            //console.log("Max nodes extracting");
            if (childNodes != null && childNodes.length > 0) {
                for (var i = 0; i < childNodes.length; i++) {
                    var childNode = childNodes[i];
                    childNode.setAlphaValue(gameNode.alphaValue);
                    childNode.setBetaValue(gameNode.betaValue);
                    var val = alphaBetaPruning(childNode, 'min');
                    gameNode.setNodeValue(val, childNode.direction);
                    gameNode.setAlphaValue(val);
                    if (gameNode.alphaValue >= gameNode.betaValue) {
                        console.log("alpha cut");
                        break;
                    }
                }
            }
        }
        else if (mode == 'min') {
            var childNodes = getChildNodes(gameNode, mode);
            //console.log("Min nodes extracting");
            if (childNodes != null && childNodes.length > 0) {
                for(var i = 0; i < childNodes.length; i++) {
                    var childNode = childNodes[i];
                    childNode.setAlphaValue(gameNode.alphaValue);
                    childNode.setBetaValue(gameNode.betaValue);
                    var val = alphaBetaPruning(childNode, 'max');
                    gameNode.setNodeValue(val, childNode.direction);
                    gameNode.setBetaValue(val);
                    if (gameNode.alphaValue >= gameNode.betaValue) {
                        console.log("beta cut");
                        break;
                    }
                }
            }
        }
        return gameNode.value;
    };
};
