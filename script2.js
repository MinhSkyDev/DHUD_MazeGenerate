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
          await sleep(1).then( async ()=>{

            await dfs(newX, newY);
          }
        );

        }
      }
    }
  }
}

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
  await sleep(100);

}

return maze;
}



//Vừa sinh vừa vẽ
//DFS
// maze = dfsGenerateMaze(50,50);

// //SlideWinder
// sideWinderGenerateMaze(100,100,0.4).then(maze => {
//   console.log(maze);
//   get2DArray();
//   drawMaze();
// })


//Vẽ xong mới log maze ra
console.log(maze);

function get2DArray() {
  //Make the 2D array to hold all objects

  grid = [];
  for (let i = 0; i < maze.length; i++) {
    grid[i] = [];
    for (let j = 0; j < maze[i].length; j++) {
      color_code = "transparent";
      if(maze[i][j] === 0){
        color_code = "#4571b9";
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

  if(algo === "DFS"){
    await dfsGenerateMaze(rows,columns);
  }
  else if(algo == "Sidewinder"){
    await sideWinderGenerateMaze(rows,columns,0.5);
  }
}

var myForm = document.getElementById("myForm")
var colorPicker = document.getElementById("mazeColor")
var dialog = document.getElementById("myDialog")
var dialogText = document.getElementById("dialogText")
var closeDialogBtn = document.getElementById("closeDialogBtn")

closeDialogBtn.onclick = () => {
  dialog.close()
}

colorPicker.onchange = () => {
  mazeColor = myForm.mazeColor.value || mazeColor
}

let gencnt =0;
myForm.onsubmit = function formHandle(e) {
  e.preventDefault();
  let mazeSize =  myForm.mazeSize.value || 50
  mazeColor = myForm.mazeColor.value || mazeColor
  // console.log(myForm.mazeAlgo.value)
  gencnt++;
  myForm.submitBtn.setAttribute('disabled', "")
  generateMaze(mazeSize, mazeSize, myForm.mazeAlgo.value).then(() => {
    myForm.submitBtn.removeAttribute('disabled');
    // dialog.showModal()
    // console.log(maze);
  })
};
