//Create an offscreen canvas. This is where we will actually be drawing,
//in order to keep the image consistent and free of distortions.
let offScreenCVS = document.getElementById("myCanvas");
let offScreenCTX = offScreenCVS.getContext("2d");

//Set the dimensions of the drawing canvas
// offScreenCVS.width = 40;
// offScreenCVS.height = 40;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let bg = document.getElementById("myCanvas"),
  bgCtx = bg.getContext("2d"),
  //sharpen * 4
  bgw = (bg.width = window.innerWidth * 4),
  bgh = (bg.height = window.innerHeight * 4);
// bg.style.width = window.innerWidth + "px";
bg.style.height = window.innerHeight + "px";


let xO = bgw * 0.5;
let yO = bgh * 0.1;

//Một ô sẽ có kích thước bao nhiêu
let cellSize = 20;
// let cellSize = 10;
//Góc nghiêng của mê cung
let perspective = 0.7;
// let perspective = 0.2;


let grid = [];
let maze = [];

async function generateMaze(rows, columns) {
  // Create the maze grid
  for (let i = 0; i < rows; i++) {
    maze[i] = [];
    for (let j = 0; j < columns; j++) {
      maze[i][j] = 0; 
      // maze[i][j] = 1; // Initialize all cells as walls
    }
  }

  console.log("Hello", maze);
  for(let i = 0; i < (rows/3); i++){
    for(let j = 0; j < (columns/3); j++){
      maze[i][j] = 1; 
    }}
  for (let i = rows-1; i >= rows-(rows/5); i--) {
    tmp = i - Math.round(rows-(rows/5))
    for (let j = 0; j < tmp; j++) {
      maze[i][j] = 1; 
      maze[j][i]=1
    }
  }
  get2DArray();
  drawMaze();
  console.log("done setting")
  // Starting point
  const startX = Math.floor(Math.random() * rows);
  const startY = Math.floor(Math.random() * columns);
  maze[startX][startY] = 1; // Set starting point as a path
  // maze[startX][startY] = 0; // Set starting point as a path

  // await dfs(startX, startY); // Start the DFS from the starting point
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
        // if (maze[newX][newY] === 1) {
        //   // Carve a path by removing the wall between the current cell and the new cell
        //   maze[x + dx][y + dy] = 0;
        //   maze[newX][newY] = 0;
        //   // Recursive call on the new cell

        //   //Covnert current maze to Grid
        //   get2DArray();
        //   //From Grid draw to the Canvas
        //   drawMaze();
        //   await sleep(1000).then(dfs(newX, newY));

        // }
        // console.log(cur_count, ":", newX, " ", newY, maze[newX][newY])
        if (maze[newX][newY] === 0) {
          // Carve a path by removing the wall between the current cell and the new cell
          maze[x + dx][y + dy] = 1;
          maze[newX][newY] = 1;
          // Recursive call on the new cell

          //Covnert current maze to Grid
          get2DArray();
          //From Grid draw to the Canvas
          drawMaze();
          // dfs(newX, newY)
          // setInterval(dfs(newX, newY), 1000)
          await sleep(100).then(console.log("draw dfs"))
          .then(async () => {await dfs(newX, newY)});

        }
      }
    }
  }
  // await dfs(startX, startY).then(()=>{return maze;})
  // return maze;
}

//Vừa sinh vừa vẽ
// maze = generateMaze(50, 50).then(()=>{console.log(maze)});
generateMaze(50, 50).then(()=>{console.log(maze)});
//Vẽ xong mới log maze ra
// console.log(maze);

function get2DArray() {
  //Make the 2D array to hold all objects
  for (let i = 0; i < maze.length; i++) {
    grid[i] = [];
    for (let j = 0; j < maze[i].length; j++) {
      color_code = "transparent";
      if (maze[i][j] === 0) {
        // color_code = "#4f71b9";
        color_code = "#f550d4";
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


//---------Render mê cung ở đây-----------//
// console.log("chuaarn bij goji")
// get2DArray();
// drawMaze();
// console.log("the end");


function drawMaze() {
  offScreenCTX.clearRect(0, 0, offScreenCVS.width, offScreenCVS.height);
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
