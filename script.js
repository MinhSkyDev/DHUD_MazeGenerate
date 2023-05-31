
let canvas = document.getElementById('myCanvas');
let context = canvas.getContext('2d');


function generateMaze(rows, columns) {
  // Create the maze grid
  const maze = [];
  for (let i = 0; i < rows; i++) {
    maze[i] = [];
    for (let j = 0; j < columns; j++) {
      maze[i][j] = 1; // Initialize all cells as walls
    }
  }

  // Starting point
  const startX = Math.floor(Math.random() * rows);
  const startY = Math.floor(Math.random() * columns);
  maze[startX][startY] = 0; // Set starting point as a path

  // Recursive depth-first search function
  function dfs(x, y) {
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
          dfs(newX, newY);
        }
      }
    }
  }

  dfs(startX, startY); // Start the DFS from the starting point

  return maze;
}

// Example usage
const mazeRows = 100;
const mazeColumns = 100;
const maze = generateMaze(mazeRows, mazeColumns);
let roadWidth = 600/maze[0].length;
let roadHeight = 600/maze.length;
// Print the maze
for (let i = 0; i < mazeRows; i++) {
  console.log(maze[i].join(' '));
}


function renderMaze(context, mazeArray) {
  for (let i = 0; i < mazeArray.length; i++) {
    for (let j = 0; j < mazeArray[i].length; j++) {
      context.beginPath();

      context.rect(j * roadWidth, i * roadHeight, roadWidth, roadHeight)

      context.fillStyle = mazeArray[i][j] === 0 ? 'white' : 'blue';
      context.fill();

      context.closePath()
    }
  }
}

renderMaze(context,maze);
