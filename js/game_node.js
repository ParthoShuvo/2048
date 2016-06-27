/**
 * Created by shuvojit on 6/26/16.
 */
var GameNode = function (depth, grid, mode, direction) {
    this.depth = depth;
    this.grid = grid;
    this.mode = mode;
    this.alphaValue = -32717;
    this.betaValue = 32787;
    this.value = this.mode == 'max' ? this.alphaValue : this.betaValue;
    this.direction = direction;



    this.setAlphaValue =  function(value){
      this.alphaValue = this.alphaValue > value ? value : this.alphaValue;
    };

    this.setBetaValue = function(value){
      this.betaValue = this.betaValue < value ? value : this.betaValue;
    };

    this.setNodeValue = function(value, direction){
        if((this.mode == 'max' && value > this.value) || (this.mode == 'min' && value < this.value)){
            this.value = value;
            this.direction = direction;
        }
    }



};
