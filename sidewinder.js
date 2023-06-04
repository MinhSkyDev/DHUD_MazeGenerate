function generateMaze(rows, cols, bias) {
  // Initialize the maze grid with all walls
  const maze = [];
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

        // Carve the passages
        for (const [cellRow, cellCol] of run) {
          maze[cellRow][cellCol] = 0;
        }

        // Mark the walls
        if (!atNorthernBoundary) {
          const [aboveRow, aboveCol] = run[Math.floor(Math.random() * run.length)];
          maze[aboveRow - 1][aboveCol] = 1; // Up wall
        }
        if (!atEasternBoundary) {
          maze[runRow][runCol + 1] = 1; // Right wall
        }

        run = [];
      }
    }
  }

  return maze;
}

// Usage example
const maze = generateMaze(30, 30, 0.2);
console.log(maze);
