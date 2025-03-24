document.addEventListener('DOMContentLoaded', function() {
    // Game constants
    const GRID_SIZE = 4;
    const CELL_SIZE = 106.25;
    const CELL_GAP = 15;

    // DOM Elements
    const gameContainer = document.querySelector('.game-container');
    const tileContainer = document.querySelector('.tile-container');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const gameMessage = document.querySelector('.game-message');
    const restartButton = document.getElementById('restart-game');
    const retryButton = document.querySelector('.retry-button');

    // Game variables
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let won = false;

    // Load best score from localStorage
    bestScoreDisplay.textContent = bestScore;

    // Initialize the game
    function initGame() {
        grid = createGrid();
        score = 0;
        gameOver = false;
        won = false;
        scoreDisplay.textContent = '0';
        gameMessage.style.display = 'none';
        gameMessage.classList.remove('game-won', 'game-over');
        
        // Clear the tile container
        while (tileContainer.firstChild) {
            tileContainer.removeChild(tileContainer.firstChild);
        }
        
        // Add initial tiles
        addRandomTile();
        addRandomTile();
    }

    // Create an empty grid
    function createGrid() {
        const grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                grid[i][j] = 0;
            }
        }
        return grid;
    }

    // Get empty cells in the grid
    function getEmptyCells() {
        const emptyCells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }
        return emptyCells;
    }

    // Add a random tile to the grid
    function addRandomTile() {
        const emptyCells = getEmptyCells();
        if (emptyCells.length > 0) {
            const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            grid[cell.x][cell.y] = value;
            
            // Create DOM element for the tile
            const tile = document.createElement('div');
            tile.className = 'tile tile-' + value + ' tile-new';
            tile.style.left = (cell.y * (CELL_SIZE + CELL_GAP)) + 'px';
            tile.style.top = (cell.x * (CELL_SIZE + CELL_GAP)) + 'px';
            tileContainer.appendChild(tile);
        }
    }

    // Move tiles in a specific direction
    function moveTiles(direction) {
        if (gameOver || won) return;

        let moved = false;
        let addedScore = 0;

        // Clone the grid for comparison
        const previousGrid = JSON.parse(JSON.stringify(grid));

        switch (direction) {
            case 'up':
                for (let j = 0; j < GRID_SIZE; j++) {
                    for (let i = 1; i < GRID_SIZE; i++) {
                        if (grid[i][j] !== 0) {
                            let row = i;
                            while (row > 0 && grid[row - 1][j] === 0) {
                                grid[row - 1][j] = grid[row][j];
                                grid[row][j] = 0;
                                row--;
                                moved = true;
                            }
                            if (row > 0 && grid[row - 1][j] === grid[row][j]) {
                                grid[row - 1][j] *= 2;
                                addedScore += grid[row - 1][j];
                                grid[row][j] = 0;
                                moved = true;
                            }
                        }
                    }
                }
                break;
            case 'right':
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = GRID_SIZE - 2; j >= 0; j--) {
                        if (grid[i][j] !== 0) {
                            let col = j;
                            while (col < GRID_SIZE - 1 && grid[i][col + 1] === 0) {
                                grid[i][col + 1] = grid[i][col];
                                grid[i][col] = 0;
                                col++;
                                moved = true;
                            }
                            if (col < GRID_SIZE - 1 && grid[i][col + 1] === grid[i][col]) {
                                grid[i][col + 1] *= 2;
                                addedScore += grid[i][col + 1];
                                grid[i][col] = 0;
                                moved = true;
                            }
                        }
                    }
                }
                break;
            case 'down':
                for (let j = 0; j < GRID_SIZE; j++) {
                    for (let i = GRID_SIZE - 2; i >= 0; i--) {
                        if (grid[i][j] !== 0) {
                            let row = i;
                            while (row < GRID_SIZE - 1 && grid[row + 1][j] === 0) {
                                grid[row + 1][j] = grid[row][j];
                                grid[row][j] = 0;
                                row++;
                                moved = true;
                            }
                            if (row < GRID_SIZE - 1 && grid[row + 1][j] === grid[row][j]) {
                                grid[row + 1][j] *= 2;
                                addedScore += grid[row + 1][j];
                                grid[row][j] = 0;
                                moved = true;
                            }
                        }
                    }
                }
                break;
            case 'left':
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = 1; j < GRID_SIZE; j++) {
                        if (grid[i][j] !== 0) {
                            let col = j;
                            while (col > 0 && grid[i][col - 1] === 0) {
                                grid[i][col - 1] = grid[i][col];
                                grid[i][col] = 0;
                                col--;
                                moved = true;
                            }
                            if (col > 0 && grid[i][col - 1] === grid[i][col]) {
                                grid[i][col - 1] *= 2;
                                addedScore += grid[i][col - 1];
                                grid[i][col] = 0;
                                moved = true;
                            }
                        }
                    }
                }
                break;
        }

        // Update the score
        if (addedScore > 0) {
            score += addedScore;
            scoreDisplay.textContent = score;
            
            // Update best score if needed
            if (score > bestScore) {
                bestScore = score;
                bestScoreDisplay.textContent = bestScore;
                localStorage.setItem('bestScore', bestScore);
            }
        }

        // Redraw the board if moved
        if (moved) {
            // Clear the tile container
            while (tileContainer.firstChild) {
                tileContainer.removeChild(tileContainer.firstChild);
            }
            
            // Redraw all tiles
            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    if (grid[i][j] !== 0) {
                        const tile = document.createElement('div');
                        tile.className = 'tile tile-' + grid[i][j];
                        tile.style.left = (j * (CELL_SIZE + CELL_GAP)) + 'px';
                        tile.style.top = (i * (CELL_SIZE + CELL_GAP)) + 'px';
                        tileContainer.appendChild(tile);
                        
                        // Check for win
                        if (grid[i][j] === 2048 && !won) {
                            won = true;
                            gameMessage.style.display = 'block';
                            gameMessage.classList.add('game-won');
                            gameMessage.querySelector('p').textContent = 'You Win!';
                        }
                    }
                }
            }
            
            // Add a new tile
            setTimeout(addRandomTile, 200);
            
            // Check for game over
            if (!canMove()) {
                gameOver = true;
                gameMessage.style.display = 'block';
                gameMessage.classList.add('game-over');
                gameMessage.querySelector('p').textContent = 'Game Over!';
            }
        }
    }

    // Check if any moves are possible
    function canMove() {
        // Check for empty cells
        if (getEmptyCells().length > 0) {
            return true;
        }
        
        // Check for possible merges horizontally
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE - 1; j++) {
                if (grid[i][j] === grid[i][j + 1]) {
                    return true;
                }
            }
        }
        
        // Check for possible merges vertically
        for (let j = 0; j < GRID_SIZE; j++) {
            for (let i = 0; i < GRID_SIZE - 1; i++) {
                if (grid[i][j] === grid[i + 1][j]) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Handle keyboard events
    document.addEventListener('keydown', function(event) {
        let direction = null;
        
        switch (event.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            default:
                return;
        }
        
        event.preventDefault();
        moveTiles(direction);
    });

    // Handle touch events for mobile play
    let touchStartX, touchStartY;
    let touchEndX, touchEndY;

    gameContainer.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });

    gameContainer.addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, { passive: false });

    gameContainer.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine the direction of the swipe
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0) {
                moveTiles('right');
            } else {
                moveTiles('left');
            }
        } else {
            // Vertical swipe
            if (dy > 0) {
                moveTiles('down');
            } else {
                moveTiles('up');
            }
        }
    });

    // Restart button event listener
    restartButton.addEventListener('click', initGame);
    retryButton.addEventListener('click', initGame);

    // Initialize the game when the page loads
    initGame();
}); 