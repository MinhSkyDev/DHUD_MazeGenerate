function generateMaze(rows, cols) {
  // Initialize the maze grid with all walls
  const maze = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(1);
    }
    maze.push(row);
  }

  // Pick a random starting cell and mark it as a path
  const startRow = getRandomOddNumber(rows);
  const startCol = getRandomOddNumber(cols);
  maze[startRow][startCol] = 0;

  // Create a list of wall cells
  const walls = [];
  if (startRow - 2 >= 0) walls.push([startRow - 2, startCol]);
  if (startRow + 2 < rows) walls.push([startRow + 2, startCol]);
  if (startCol - 2 >= 0) walls.push([startRow, startCol - 2]);
  if (startCol + 2 < cols) walls.push([startRow, startCol + 2]);

  // Randomized Prim's Algorithm
  while (walls.length > 0) {
    const randomIndex = Math.floor(Math.random() * walls.length);
    const [wallRow, wallCol] = walls[randomIndex];
    walls.splice(randomIndex, 1);

    const pathRow = wallRow + Math.sign(startRow - wallRow);
    const pathCol = wallCol + Math.sign(startCol - wallCol);

    if (pathRow >= 0 && pathRow < rows && pathCol >= 0 && pathCol < cols) {
      if (maze[pathRow][pathCol] === 1) {
        maze[wallRow][wallCol] = 0;
        maze[pathRow][pathCol] = 0;

        if (wallRow - 2 >= 0 && maze[wallRow - 2][wallCol] === 1) {
          walls.push([wallRow - 2, wallCol]);
        }
        if (wallRow + 2 < rows && maze[wallRow + 2][wallCol] === 1) {
          walls.push([wallRow + 2, wallCol]);
        }
        if (wallCol - 2 >= 0 && maze[wallRow][wallCol - 2] === 1) {
          walls.push([wallRow, wallCol - 2]);
        }
        if (wallCol + 2 < cols && maze[wallRow][wallCol + 2] === 1) {
          walls.push([wallRow, wallCol + 2]);
        }
      }
    }
  }

  return maze;
}

function getRandomOddNumber(max) {
  return Math.floor(Math.random() * (max / 2)) * 2 + 1;
}

// Usage example
const maze = generateMaze(30, 30);
console.log(maze);
