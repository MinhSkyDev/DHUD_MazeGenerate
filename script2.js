//Create an offscreen canvas. This is where we will actually be drawing,
//in order to keep the image consistent and free of distortions.
let offScreenCVS = document.getElementById("myCanvas");
let offScreenCTX = offScreenCVS.getContext("2d");

//Set the dimensions of the drawing canvas
// offScreenCVS.width = 40;
// offScreenCVS.height = offScreenCVS.width * 0.5625;

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
let cellSize = 20;

//Góc nghiêng của mê cung
let perspective = 0.7;

let grid = [];
let maze = [];

let mazeColor =  "#4f71b9"
let stopGenerate = false;
let currentlyGenerate = false;

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

function get2DArray() {
  //Make the 2D array to hold all objects
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
// DFS co cancel
// async function dfs(x, y, rows, columns, cnt) {
//   console.log("start ", cnt, " dfs")
//   const directions = [
//     [1, 0],  // Down
//     [0, 1],  // Right
//     [-1, 0], // Up
//     [0, -1]  // Left
//   ];
//   directions.sort(() => Math.random() - 0.5); // Randomize the order of directions

//   for (let i = 0; i < directions.length; i++) {
//     if(stopGenerate == false) {
//       const [dx, dy] = directions[i];
//       const newX = x + (dx * 2); // Move two cells in the x direction
//       const newY = y + (dy * 2); // Move two cells in the y direction

//       // Check if the new cell is within the maze bounds
//       if (newX >= 0 && newX < rows && newY >= 0 && newY < columns) {
//         // Check if the new cell is a wall
//         if (maze[newX][newY] === 1) {
//           // Carve a path by removing the wall between the current cell and the new cell
//           maze[x + dx][y + dy] = 0;
//           maze[newX][newY] = 0;
//           // Recursive call on the new cell

//           //Covnert current maze to Grid
//           get2DArray();
//           //From Grid draw to the Canvas
//           drawMaze();
//           await sleep(100).then(async() => {await dfs(newX, newY, rows, columns, cnt + 1)} );
//         }
//       }
//     }
//     else {
//       console.log("cancaling")
//       if (cnt === 0) {
//         console.log("done cancel")
//          stopGenerate = false;
//       }
//       break;
//     }
//   }
//   console.log("End ", cnt, " dfs")
// }

async function dfs(x, y, rows, columns, cnt) {
  // console.log("start ", cnt, " dfs")
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
        await sleep(100).then(async() => {await dfs(newX, newY, rows, columns, cnt + 1)} );
      }
    }
  }
  // console.log("End ", cnt, " dfs")
}

async function generateMaze(rows, columns, algo) {
  // Create the maze grid
  // var cnt =0;
  for (let i = 0; i < rows; i++) {
    maze[i] = [];
    for (let j = 0; j < columns; j++) {
      maze[i][j] = 1; // Initialize all cells as walls
    }
  }
  get2DArray();
  drawMaze();
  //done setting
  // Starting point
  const startX = Math.floor(Math.random() * rows);
  const startY = Math.floor(Math.random() * columns);
  maze[startX][startY] = 0; // Set starting point as a path
  console.log("ready")
  if (currentlyGenerate) {
    stopGenerate = true;
    sleep(500).then(async () => {await generateMaze(rows, columns)})
  }
  else {
    currentlyGenerate = true;
    if(algo == "DFS") {
      await dfs(startX, startY, rows, columns, 0); // Start the DFS from the starting point
    }
    currentlyGenerate = false
  }
  // Recursive depth-first search function
  return maze;
}

var myForm = document.getElementById("myForm")
var colorPicker = document.getElementById("mazeColor")
var dialog = document.getElementById("myDialog")
var dialogText = document.getElementById("dialogText")
var closeDialogBtn = document.getElementById("closeDialogBtn")

closeDialogBtn.onclick = () => {
  console.log("click")
  dialog.removeAttribute('open')
  dialog.setAttribute('close', "")
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
    myForm.submitBtn.removeAttribute('disabled')
    dialog.removeAttribute('close')
    dialog.setAttribute('open', "")
    dialogText.innerHTML = "Done"
    console.log(maze);
  });
}

//Vừa sinh vừa vẽ
// maze = 
// generateMaze(50,50).then(() => {
//   console.log("done")
//   console.log(maze);
// });
//Vẽ xong mới log maze ra
// console.log(maze);



//---------Render mê cung ở đây-----------//
// get2DArray();
// drawMaze();
// console.log("the end");
