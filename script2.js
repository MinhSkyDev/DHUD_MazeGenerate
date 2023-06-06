function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let bg = document.getElementById("myCanvas"),
  bgCtx = bg.getContext("2d"),
  //sharpen * 4
  bgw = (bg.width = window.innerWidth * 4),
  bgh = (bg.height = window.innerHeight * 4);
// bg.style.width = window.innerWidth + "px";
// bg.style.height =   (bg.style.width*0.5625) + "px";
// bg.style.height = window.innerWidth + "px";

let xO = bgw * 0.5;
let yO = bgh * 0.1;

//Một ô sẽ có kích thước bao nhiêu
let cellSize = 15;
let ratio = [0, 5, 5, 4, 3, 2, 1, 1, 1, 1, 1 ]
let spdRatio = 50;

//Góc nghiêng của mê cung
let perspective = 0.7;

let grid = [];
let maze = [];

async function dfsGenerateMaze(rows, columns) {
  maze = [];
  // Create the maze grid
  for (let i = 0; i < rows; i++) {
    maze[i] = [];
    for (let j = 0; j < columns; j++) {
      maze[i].push(1); // Initialize all cells as walls
    }
  }

  console.log("Hello",maze);

  get2DArray();
  drawMaze();
  // Starting point
  const startX = Math.floor(Math.random() * rows);
  const startY = Math.floor(Math.random() * columns);
  maze[startX][startY] = 0; // Set starting point as a path

  await dfs(startX, startY); // Start the DFS from the starting point

  // Recursive depth-first search function
  async function dfs(x, y) {
    // console.log("Hello insde DFS");
    const directions = [
      [1, 0],  // Down
      [0, 1],  // Right
      [-1, 0], // Up
      [0, -1]  // Left
    ];
    directions.sort(() => Math.random() - 0.5); // Randomize the order of directions

    for (let i = 0; i < directions.length; i++) {
      const [dx, dy] = directions[i];
      const newX = x + (dx * 2); // Move two cells in the x direction
      const newY = y + (dy * 2); // Move two cells in the y direction

      // Check if the new cell is within the maze bounds
      if (newX >= 0 && newX < rows && newY >= 0 && newY < columns) {
        // Check if the new cell is a wall
        if (maze[newX][newY] === 1) {
          // Carve a path by removing the wall between the current cell and the new cell
          maze[x + dx][y + dy] = 0;
          maze[newX][newY] = 0;
          // Recursive call on the new cell

          //Covnert current maze to Grid
          get2DArray();
          //From Grid draw to the Canvas
          drawMaze();
          await sleep((2100-spdRatio*20)).then( async ()=>{

            await dfs(newX, newY);
          }
        );

        }
      }
    }
  }
}
async function sideWinderGenerateMaze(rows, cols, bias) {
  maze = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(1);
    }
    maze.push(row);
  }

  // Generate the maze
  for (let row = 0; row < rows; row++) {
    let run = [];
    for (let col = 0; col < cols; col++) {
      run.push([row, col]);

      const atEasternBoundary = col === cols - 1;
      const atNorthernBoundary = row === 0;

      const shouldCloseOut =
      atEasternBoundary ||
      (!atNorthernBoundary && Math.random() < bias);

      if (shouldCloseOut) {
        const [runRow, runCol] = run[Math.floor(Math.random() * run.length)];
        maze[runRow][runCol] = 1;

        if (!atNorthernBoundary) {
          const [aboveRow, aboveCol] = run[Math.floor(Math.random() * run.length)];
          maze[aboveRow - 1][aboveCol] = 0;
        }

        run = [];
      } else {
        maze[row][col] = 1;
      }
    }
    get2DArray();
    drawMaze();
    await sleep((2100-spdRatio*20));

  }
  return maze;
}

///***Eller Algorithm***
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
var rows_eller = [];
function makeEllerRows(rows,cellCount) {
  function randomBool() {
    return Math.random() < 0.5;
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
async function createEllerMaze(rows,cellCount){
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
    let row_mid = [];
    let row_bottom = [];
    let row_up = [];
    initRow(row_up, row_mid, row_bottom);
    for(let j=0; j< rows[i].length; j++){
      mid_position = 1 + j*3;
      row_mid[mid_position] = 0;

      //left
      if(rows[i][j].left){
        row_mid[mid_position -1] = 0;
      }
      else{
        row_mid[mid_position -1] = 1;
      }

      //right
      if(rows[i][j].right){
        row_mid[mid_position +1] = 0;
      }
      else{
        row_mid[mid_position +1] = 1;
      }

      if(rows[i][j].bottom){
        row_bottom[mid_position] = 0;
      }
      else{
        row_bottom[mid_position] = 1;
      }

      //proccess every things left
      for(let index =0; index< row_mid.length; index++){
        // if(row_up[index] == -1){
        //   row_up[index] = 1;
        // }
        // else{
        //   //Do nothing
        // }

        if(row_bottom[index] == -1){
          row_bottom[index] = 1;
        }
        else{
          //do nothing
        }
      }
    }
    maze.push(row_mid);
    maze.push(row_bottom);
    get2DArray();
    drawMaze();
    await sleep((2100-spdRatio*20));
  }
  get2DArray();
  drawMaze();
}

//thêm phương thức cho lớp Set
Set.prototype.union = function(setB) {
  for (let elem of setB) {
    elem.parentSet = this;
    this.add(elem)
  }
}




//**Drawing function**
function drawCube(x, y, wx, wy, h, color, per) {
  //left
  bgCtx.beginPath();
  bgCtx.moveTo(x, y);
  bgCtx.lineTo(x - wx, y - wx * per);
  bgCtx.lineTo(x - wx, y - h - wx * per);
  bgCtx.lineTo(x, y - h * 1);
  bgCtx.closePath();
  bgCtx.fillStyle = shadeColor(color, 10);
  bgCtx.strokeStyle = shadeColor(color, 10);
  bgCtx.stroke();
  bgCtx.fill();

  //right
  bgCtx.beginPath();
  bgCtx.moveTo(x, y);
  bgCtx.lineTo(x + wy, y - wy * per);
  bgCtx.lineTo(x + wy, y - h - wy * per);
  bgCtx.lineTo(x, y - h * 1);
  bgCtx.closePath();
  bgCtx.fillStyle = shadeColor(color, -10);
  bgCtx.strokeStyle = shadeColor(color, -10);
  bgCtx.stroke();
  bgCtx.fill();

  //top
  bgCtx.beginPath();
  bgCtx.moveTo(x, y - h);
  bgCtx.lineTo(x - wx, y - h - wx * per);
  bgCtx.lineTo(x - wx + wy, y - h - (wx * per + wy * per));
  bgCtx.lineTo(x + wy, y - h - wy * per);
  bgCtx.closePath();
  bgCtx.fillStyle = shadeColor(color, 20);
  bgCtx.strokeStyle = shadeColor(color, 20);
  bgCtx.stroke();
  bgCtx.fill();
}

// function get2DArray() {
//   //Make the 2D array to hold all objects

//   grid = [];
//   for (let i = 0; i < maze.length; i++) {
//     grid[i] = [];
//     for (let j = 0; j < maze[i].length; j++) {
//       color_code = "transparent";
//       if(maze[i][j] === 0){
//         color_code = "#4571b9";
//       }
//       grid[i][j] = {
//         color: color_code,
//         cost: 1,
//         type: "free",
//         x: i,
//         y: j,
//         gCost: 0,
//         hCost: 0,
//         fCost: 0
//       };
//     }
//   }
// }

function drawMaze() {
  bgCtx.clearRect(0, 0, bg.width, bg.height);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      let xPos = xO + cellSize * (x - y);
      let yPos = yO + perspective * (cellSize * (x + y));
      if (grid[y][x].color === "transparent") {
        continue;
      }
      drawCube(
        xPos,
        yPos,
        cellSize,
        cellSize,
        cellSize,
        grid[y][x].color,
        perspective
      );
    }
  }
}

function shadeColor(color, percent) {
  color = color.substr(1);
  var num = parseInt(color, 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function get2DArray() {
  //Make the 2D array to hold all objects
  grid=[]
  for (let i = 0; i < maze.length; i++) {
    grid[i] = [];
    for (let j = 0; j < maze[i].length; j++) {
      color_code = "transparent";
      if(maze[i][j] === 0){
        color_code = mazeColor;
      }
      grid[i][j] = {
        color: color_code,
        cost: 1,
        type: "free",
        x: i,
        y: j,
        gCost: 0,
        hCost: 0,
        fCost: 0
      };
    }
  }
}



async function generateMaze(rows, columns, algo) {
  // let cellratio = Math.max(Math.round(Math.sqrt(10000/ (rows*columns))) - 1, 1)
  let cellratio = Math.min(ratio[Math.floor(rows/10)], ratio[Math.floor(columns/10)])

  // console.log(cellratio)
  cellSize = cellSize * cellratio
  if(algo === "DFS"){
    await dfsGenerateMaze(rows,columns);
  }
  else if(algo == "Sidewinder"){
    await sideWinderGenerateMaze(rows,columns,0.5);
  }
  else if(algo == "Eller"){
    cellSize /=cellratio
    cellratio = Math.min(ratio[Math.floor(rows/10)+1], ratio[Math.floor(columns/10)+1])
    cellSize = cellSize * cellratio
    rows_eller = [];
    makeEllerRows(rows_eller,rows);
    await createEllerMaze(rows_eller,rows);
    // console.log(maze);
  }
  cellSize /=cellratio
}

var myForm = document.getElementById("myForm")
var colorPicker = document.getElementById("mazeColor")
var dialog = document.getElementById("myDialog")
var dialogText = document.getElementById("dialogText")
var closeDialogBtn = document.getElementById("closeDialogBtn")
var speed = document.getElementById("spdbar")
var speedText = document.getElementById("spd-value")

speed.onchange = () => {
  // console.log(speed.value)
  speedText.innerHTML = speed.value
  spdRatio = speed.value
}

closeDialogBtn.onclick = () => {
  dialog.close()
}

colorPicker.onchange = () => {
  mazeColor = myForm.mazeColor.value || mazeColor
}

myForm.onsubmit = function formHandle(e) {
  e.preventDefault();
  let mazeWidth =  myForm.width.value || 50;
  let mazeHeight =  myForm.height.value || 50;
  mazeColor = myForm.mazeColor.value || mazeColor
  myForm.submitBtn.setAttribute('disabled', "")
  generateMaze(mazeWidth, mazeHeight, myForm.mazeAlgo.value).then(() => {
    myForm.submitBtn.removeAttribute('disabled');
    dialog.showModal()
    console.log(maze);
  })
};
