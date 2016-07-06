/**
 * Created by shuvojit on 6/25/16.
 */
var PlayerAI = function () {
    this.initialDepth = 0;
    var cellShifter = new GridCellShifter();
    var currentChildNodes = null;
    var flag = true;
    var maxTile = null;

    /**
     * heuristic value weight
     */
    var smoothWeight = 0.7, monotonicityWeight = 1.0, emptyWeight = 2.7,
        maxWeight = 1.0;

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
    this.setCurrentGrid = function (grid, score) {
        //console.log(grid.cells);
        this.currentNode = new GameNode(this.initialDepth, grid, 'max', null, score);
    };

    /***
     * get AI player direction
     * @returns {number}
     */
    this.getAIPlayerDirection = function () {
        maxTile = new GridScorer(this.currentNode.grid.cells).getGridMaxTile();
        var bestValue = alphaBetaPruning(this.currentNode, 'max');
        var direction = null;
        console.log("Best Value: " + bestValue);
        for (var i = 0; i < currentChildNodes.length; i++) {
            if (currentChildNodes[i].value == bestValue) {
                direction = currentChildNodes[i].direction;
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
    function getHeuristicValue(grid, actualScore) {
        var gridScorer = new GridScorer(grid.cells);
        var gridMaxCell = gridScorer.getGridMaxTile();
        var countOfEmptyCells = grid.cellsAvailable() ? Math.log(grid.availableCells().length) : 0;
        /*var monotonicity = gridScorer.getMonotonicityScore();*/
        var smoothness = gridScorer.getSmoothness();
        var monotonicity2 = gridScorer.getMonotonicityScore2();
        /*var rightMostCornerMaxValue = 0;
        if (gridMaxCell.x == 3 && gridMaxCell.y == 3) {
            rightMostCornerMaxValue = Math.log(gridMaxCell.value + grid.cells[3][2] + grid.cells[3][1] + grid.cells[3][0]);
        }*/
        var heuristicVal = maxWeight * gridMaxCell.value +
            Math.log(actualScore) * countOfEmptyCells + monotonicityWeight * monotonicity2 +
            smoothWeight * smoothness;
        return heuristicVal;

    };

    function getHeuristicValue2(grid, actualScore) {
        var gridScorer = new GridScorer(grid.cells);
        var countOfEmptyCells = grid.cellsAvailable() ? grid.availableCells().length : 0;
        var clusterScore = gridScorer.getClusterScore();
        var heuristicVal = actualScore + Math.log(actualScore) * countOfEmptyCells - clusterScore;
        return heuristicVal;
    };

    /**
     get childNodes
     **/
    function getChildNodes(parentNode, mode) {
        var childNodes = [];
        if (mode == 'max') {
            childNodes = getMaxParentChildNodes(parentNode);
            if (flag) {
                currentChildNodes = [];
                for (var i = 0; i < childNodes.length; i++) {
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
    function getMaxParentChildNodes(parentNode) {
        var childNodes = [];
        for (var direction = 0; direction <= 3; direction++) {
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
                var newGameNode = new GameNode(parentNode.depth + 1, newGrid, 'min', direction, parentNode.score + res.score);
                var newMaxTile = new GridScorer(newGameNode.grid.cells).getGridMaxTile();
                if ((direction == 0 || direction == 3) && (maxTile.x == 3 && maxTile.y == 3) &&
                    (newMaxTile.x != 3 || newMaxTile.y != 3) && (parentNode.depth+1) == 1) {
                    newGameNode.badMove = true;
                }
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
            newGrid.insertTile(new Tile({x: freeCells[i].x, y: freeCells[i].y}, 2));
            //console.log("child node");
            //console.log(newGrid.showCells());
            childNodes.push(new GameNode(parentNode.depth + 1, newGrid, 'max', parentNode.direction, parentNode.score));
            //for value 4 tile
            newGrid = _.cloneDeep(parentNode.grid);
            newGrid.insertTile(new Tile({x: freeCells[i].x, y: freeCells[i].y}, 4));
            //console.log("child node");
            //console.log(newGrid.showCells());
            childNodes.push(new GameNode(parentNode.depth + 1, newGrid, 'max', parentNode.direction, parentNode.score));
        }
        return childNodes;
    };

//alpha beta pruning algorithm
    function alphaBetaPruning(gameNode, mode) {

        if (isGameTerminated(gameNode)) {
            if (gameNode.grid.isWin()) {
                gameNode.setNodeValue(100000);
            }
            else {
                gameNode.setNodeValue(-100000);
            }
            return gameNode.value;
        }
        else if (gameNode.badMove) {
            gameNode.setNodeValue(-100000);
            return gameNode.value;
        }
        else if (gameNode.depth == 5) {
            var heuristicVal = getHeuristicValue(gameNode.grid, gameNode.score) /*+ gameNode.bonusValue*/;
            gameNode.setNodeValue(heuristicVal);
            if (gameNode.mode == 'max') {
                gameNode.setAlphaValue(heuristicVal);
            }
            else {
                gameNode.setBetaValue(heuristicVal);
            }
            return gameNode.value;
        }
        //recursive case
        else {
            if (mode == 'max') {
                var maxChildNodes = getChildNodes(_.cloneDeep(gameNode), mode);
                //console.log("Max nodes extracting");
                if (maxChildNodes != null && maxChildNodes.length > 0) {
                    for (var i = 0; i < maxChildNodes.length; i++) {
                        var maxChildNode = maxChildNodes[i];
                        maxChildNode.setAlphaValue(gameNode.alphaValue);
                        maxChildNode.setBetaValue(gameNode.betaValue);
                        var val = alphaBetaPruning(maxChildNode, 'min');
                        gameNode.setNodeValue(val);
                        gameNode.setAlphaValue(val);
                        if (gameNode.alphaValue >= gameNode.betaValue) {
                            break;
                        }
                    }
                }
            }
            else if (mode == 'min') {
                if (gameNode.grid.cellsAvailable()) {
                    var minChildNodes = getChildNodes(_.cloneDeep(gameNode), mode);
                    if (minChildNodes != null && minChildNodes.length > 0) {
                        for (var i = 0; i < minChildNodes.length; i++) {
                            var childNode = minChildNodes[i];
                            childNode.setAlphaValue(gameNode.alphaValue);
                            childNode.setBetaValue(gameNode.betaValue);
                            var val = alphaBetaPruning(childNode, 'max');
                            gameNode.setNodeValue(val);
                            gameNode.setBetaValue(val);
                            if (gameNode.alphaValue >= gameNode.betaValue) {
                                //console.log("beta cut");
                                break;
                            }
                        }
                    }
                }
                else {
                    gameNode.setNodeValue(0);
                    gameNode.betaValue(0);
                }
            }
            return gameNode.value;
        }
    };

    function isGameTerminated(gameNode) {
        var terminated = false;
        if (isPlayerAIWon(gameNode)) {
            terminated = true;
        }
        else if (!gameNode.grid.cellsAvailable() && !cellShifter.isMovedPossible(gameNode.grid.cells)) {
            terminated = true;
        }
        return terminated;
    };


    function isPlayerAIWon(gameNode) {
        var playerWon = false;
        var MINIMUM_SCORE = 18432;
        if (gameNode.score >= MINIMUM_SCORE && gameNode.grid.isWin()) {
            playerWon = true;
        }
        return playerWon;
    };


    function alphaBetaPruning2(gameNode, mode) {
        if (isGameTerminated(gameNode)) {
            if (gameNode.grid.isWin()) {
                gameNode.setNodeValue(Number.MAX_VALUE);
            }
            else {
                gameNode.setNodeValue(Number.MIN_VALUE);
            }
            return gameNode.value;
        }
        else if (gameNode.depth == 7) {
            return getHeuristicValue2(gameNode.grid, gameNode.score);
        }
        else {
            if (mode == 'max') {
                var maxChildNodes = getChildNodes(_.cloneDeep(gameNode), mode);
                for (var i = 0; i < maxChildNodes.length; i++) {
                    var maxChildNode = maxChildNodes[i];
                    maxChildNode.setAlphaValue(gameNode.alphaValue);
                    maxChildNode.setBetaValue(gameNode.betaValue);
                    var val = alphaBetaPruning(maxChildNode, 'min');
                    gameNode.setAlphaValue(val);
                    gameNode.setNodeValue(val);
                    if (gameNode.alphaValue >= gameNode.betaValue) {
                        console.log("prune");
                        break;
                    }
                }
            }
            else {
                if (gameNode.grid.cellsAvailable()) {
                    var minChildNodes = getChildNodes(_.cloneDeep(gameNode), mode);
                    for (var i = 0; i < minChildNodes.length; i++) {
                        var childNode = minChildNodes[i];
                        childNode.setAlphaValue(gameNode.alphaValue);
                        childNode.setBetaValue(gameNode.betaValue);
                        var val = alphaBetaPruning(childNode, 'max');
                        gameNode.setBetaValue(val);
                        gameNode.setNodeValue(val);
                        if (gameNode.alphaValue >= gameNode.betaValue) {
                            console.log("prune");
                            break;
                        }
                    }
                }

                else {
                    gameNode.setNodeValue(0);
                    gameNode.setBetaValue(0);
                }
            }
            return gameNode.value;
        }
    };
};



