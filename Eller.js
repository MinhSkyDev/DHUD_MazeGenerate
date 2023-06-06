class Cell {
    constructor(x, y) {
        this.top = false;
        this.bottom = false;
        this.left = false;
        this.right = false;

        // write only for equality comparison
        this.x = x;
        this.y = y;

        this.parentSet = null;
    }
}
var rows = [];

function makeRows(rows,cellCount) {

  function randomBool() {
    return Math.random() < 0.9;
  }

    var currentRow = []
    for (var q=0; q<cellCount; q++) {
        var y = rows.length;
        // 1. create the first row, no cells are members of any set
        if (rows.length == 0) {
            console.log("creating the first row");
            for (var x=0; x<cellCount; x++) {
                var c = new Cell(x, y);
                currentRow.push(c);
            }
        }

        // 2. join any cells not members of a set to their own unique set
        console.log("making unique sets for lone cells");
        for (var i=0; i<currentRow.length; i++) {
            if (currentRow[i].parentSet == null) {
                currentRow[i].parentSet = new Set();
                currentRow[i].parentSet.add(currentRow[i]);
            }
        }

        // 3. create right walls, moving from left to right
        console.log("creating right walls")
        for (var i=0; i<currentRow.length-1; i++) {
            // if the current cell and the cell to the right
            // are members of the same set, always create a wall between them
            // if not, randomly add right walls
            if (
                (currentRow[i].parentSet === currentRow[i+1].parentSet) || randomBool()
                ) {
                currentRow[i].right = true;
            } else {
                // if no wall, union the sets
                currentRow[i].parentSet.union(currentRow[i+1].parentSet);
            }
        }

        // 4. create bottom walls, moving from left to right
        console.log("creating bottom rows");
        for (var i=0; i<currentRow.length; i++) {
            // if the cell is the only one in its set, don't make a bottom wall
            // if the cell is the only member of its set without a bottom wall, don't make a bottom wall
            // if not, randomly add a bottom wall
            if (
                currentRow[i].parentSet.size > 0
                && !(!currentRow[i].bottom && (notBottomCount(currentRow[i].parentSet) == 1))
                && randomBool()
                ) {
                    currentRow[i].bottom = true;
                }
        }

        //5. if it's the last row
        if (rows.length == cellCount-1) {
            // add a bottom wall to every cell
            //print("done, cleaning up");

            // if current cell and cell to right are different sets
            for (var i=0; i<currentRow.length-1; i++) {
                if (currentRow[i].parentSet != currentRow[i+1].parentSet) {
                    // remove the right wall
                    currentRow[i].right = false;
                    currentRow[i+1].left = false;
                    // union sets
                    currentRow[i].parentSet.union(currentRow[i+1].parentSet);
                }
            }
            // then output
            output(currentRow);
        } else {
            // output the current row
            output(currentRow);

            for (var i=0; i<currentRow.length-1; i++) {
                currentRow[i].right = false;
            }
            //remove all cells with a bottom wall from their set
            for (var i=0; i<currentRow.length; i++) {
                if (currentRow[i].bottom) {
                    currentRow[i].parentSet.delete(currentRow[i]);
                    currentRow[i].parentSet = null;
                }
            }
            // remove all bottom walls
            for (var i=0; i<currentRow.length; i++) {
                currentRow[i].bottom = false;
            }
        }
        // console.log(currentRow);
    }

    // finally add the walls on the top and sides
    console.log("done, cleaning up");
    for (var i=0; i<rows.length; i++) {
        for (var j=0; j<rows[i].length; j++) {
            if (i == 0) {
                rows[i][j].top = true;
            } else if (i == rows.length-1) {
                rows[i][j].bottom = true;
            }

            if (j == 0) {
                rows[i][j].left = true;
            } else if (j == rows[i].length-1) {
                rows[i][j].right = true;
            }
        }
    }

    rows[0][0].top = false;
    rows[rows.length-1][rows[0].length-1].bottom = false;


    function output(row) {
      rows.push(JSON.parse(JSON.stringify(row)));
      // then move y down
      for (var i=0; i<row.length; i++) {
        row[i].y += 1;
      }
    }

    function notBottomCount(s) {
      var c = 0;
      s.forEach(function(x) {
        if (!x.bottom) c++;
      });
      return c;
    }

}

Set.prototype.union = function(setB) {
  for (let elem of setB) {
    elem.parentSet = this;
    this.add(elem)
  }
}



makeRows(rows,25);
maze = [];

createEllerMaze(25);
console.log(maze);

function createEllerMaze(cellCount){
  maze = [];
  function initRow(row_up,row_mid,row_down){
    for(let i =0; i< cellCount; i++){
      for(let j = 0; j < 3;j++){
        row_up.push(-1);
        row_mid.push(-1);
        row_down.push(-1);
      }
    }
  }

  for(let i =0; i< rows.length; i++){
    let row_up = [];
    let row_mid = [];
    let row_bottom = [];
    initRow(row_up, row_mid, row_bottom);
    for(let j=0; j< rows[i].length; j++){
      mid_position = 1 + j*3;
      row_mid[mid_position] = 0;
      //top
      if(rows[i][j].top){
        row_up[mid_position] = 1;
      }
      else{
        row_up[mid_position] = 0;
      }

      //left
      if(rows[i][j].left){
        row_mid[mid_position -1] = 1;
      }
      else{
        row_mid[mid_position -1] = 0;
      }

      //right
      if(rows[i][j].right){
        row_mid[mid_position +1] = 1;
      }
      else{
        row_mid[mid_position +1] = 0;
      }

      if(rows[i][j].bottom){
        row_bottom[mid_position] = 1;
      }
      else{
        row_bottom[mid_position] = 0;
      }

      //proccess every things left
      for(let index =0; index< row_mid.length; index++){
        if(row_up[index] == -1){
          row_up[index] = 0;
        }
        else{
          //Do nothing
        }

        if(row_bottom[index] == -1){
          row_bottom[index] = 0;
        }
        else{
          //do nothing
        }
      }
    }
    maze.push(row_up);
    maze.push(row_mid);
    maze.push(row_bottom);
  }
}
