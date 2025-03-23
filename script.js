document.addEventListener('DOMContentLoaded', function() {
    // 游戏主类
    class Game2048 {
        constructor() {
            this.gridSize = 4;
            this.startTiles = 2;
            this.tileContainer = document.querySelector('.tile-container');
            this.gridContainer = document.querySelector('.grid-container');
            this.scoreDisplay = document.getElementById('score');
            this.bestScoreDisplay = document.getElementById('best-score');
            this.messageContainer = document.querySelector('.game-message');
            this.score = 0;
            this.bestScore = this.getBestScore();
            this.grid = [];
            this.won = false;
            this.over = false;
            this.keepPlaying = false;
            
            this.setup();
            this.addEventListeners();
        }
        
        // 初始化游戏
        setup() {
            this.grid = this.createGrid();
            this.updateScore(0);
            this.clearMessage();
            this.clearTiles();
            
            // 添加初始方块
            for (let i = 0; i < this.startTiles; i++) {
                this.addRandomTile();
            }
        }
        
        // 创建网格
        createGrid() {
            let grid = [];
            for (let x = 0; x < this.gridSize; x++) {
                grid[x] = [];
                for (let y = 0; y < this.gridSize; y++) {
                    grid[x][y] = null;
                }
            }
            return grid;
        }
        
        // 添加随机方块
        addRandomTile() {
            if (this.availableCells().length > 0) {
                const value = Math.random() < 0.9 ? 2 : 4;
                const cell = this.randomAvailableCell();
                
                const tile = {
                    x: cell.x,
                    y: cell.y,
                    value: value,
                    merged: false
                };
                
                this.grid[cell.x][cell.y] = tile;
                this.addTileElement(tile);
            }
        }
        
        // 获取可用单元格
        availableCells() {
            const cells = [];
            for (let x = 0; x < this.gridSize; x++) {
                for (let y = 0; y < this.gridSize; y++) {
                    if (!this.grid[x][y]) {
                        cells.push({ x: x, y: y });
                    }
                }
            }
            return cells;
        }
        
        // 随机获取一个可用单元格
        randomAvailableCell() {
            const cells = this.availableCells();
            if (cells.length) {
                return cells[Math.floor(Math.random() * cells.length)];
            }
            return null;
        }
        
        // 添加方块元素到DOM
        addTileElement(tile) {
            const element = document.createElement('div');
            element.classList.add('tile', `tile-${tile.value}`);
            element.classList.add('tile-new');
            element.style.top = `${this.getTilePosition(tile.x)}px`;
            element.style.left = `${this.getTilePosition(tile.y)}px`;
            
            this.tileContainer.appendChild(element);
        }
        
        // 获取方块位置
        getTilePosition(pos) {
            const cellSize = this.getCellSize();
            const gap = 15; // 间隙大小
            return pos * (cellSize + gap) + 15; // 15是容器的内边距
        }
        
        // 获取单元格大小
        getCellSize() {
            const containerWidth = this.gridContainer.clientWidth;
            return (containerWidth - 15 * 5) / 4; // 15是间隙大小，5是间隙数量+容器内边距
        }
        
        // 清除所有方块
        clearTiles() {
            this.tileContainer.innerHTML = '';
        }
        
        // 更新分数
        updateScore(score) {
            this.score = score;
            this.scoreDisplay.textContent = this.score;
            
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.bestScoreDisplay.textContent = this.bestScore;
                localStorage.setItem('bestScore', this.bestScore);
            }
        }
        
        // 获取最高分
        getBestScore() {
            const bestScore = localStorage.getItem('bestScore');
            return bestScore ? parseInt(bestScore) : 0;
        }
        
        // 添加事件监听
        addEventListeners() {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            document.getElementById('new-game-button').addEventListener('click', this.restart.bind(this));
            document.querySelector('.retry-button').addEventListener('click', this.restart.bind(this));
            
            // 触摸事件
            let touchStartX, touchStartY;
            let touchEndX, touchEndY;
            
            document.addEventListener('touchstart', (event) => {
                if (event.touches.length > 1) return;
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
                event.preventDefault();
            }, { passive: false });
            
            document.addEventListener('touchend', (event) => {
                if (event.changedTouches.length > 1) return;
                touchEndX = event.changedTouches[0].clientX;
                touchEndY = event.changedTouches[0].clientY;
                
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // 水平滑动
                        if (dx > 0) {
                            this.move(0, 1); // 右
                        } else {
                            this.move(0, -1); // 左
                        }
                    } else {
                        // 垂直滑动
                        if (dy > 0) {
                            this.move(1, 0); // 下
                        } else {
                            this.move(-1, 0); // 上
                        }
                    }
                }
                
                event.preventDefault();
            }, { passive: false });
        }
        
        // 处理键盘事件
        handleKeyDown(event) {
            if (this.over && !this.keepPlaying) return;
            
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.move(-1, 0);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.move(1, 0);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.move(0, -1);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.move(0, 1);
                    break;
            }
        }
        
        // 移动方块
        move(dx, dy) {
            if (this.over && !this.keepPlaying) return;
            
            let moved = false;
            const traversals = this.buildTraversals(dx, dy);
            
            // 保存当前状态
            const previousGrid = JSON.parse(JSON.stringify(this.grid));
            
            // 清除合并标记
            this.prepareTiles();
            
            // 遍历网格
            traversals.x.forEach(x => {
                traversals.y.forEach(y => {
                    const tile = this.grid[x][y];
                    
                    if (tile) {
                        const positions = this.findFarthestPosition({ x, y }, dx, dy);
                        const next = this.grid[positions.next.x][positions.next.y];
                        
                        // 合并方块
                        if (next && next.value === tile.value && !next.merged) {
                            const merged = {
                                x: positions.next.x,
                                y: positions.next.y,
                                value: tile.value * 2,
                                merged: true
                            };
                            
                            this.grid[positions.next.x][positions.next.y] = merged;
                            this.grid[x][y] = null;
                            
                            // 更新分数
                            this.updateScore(this.score + merged.value);
                            
                            // 检查是否获胜
                            if (merged.value === 2048 && !this.won) {
                                this.won = true;
                                this.showMessage(true);
                            }
                            
                            moved = true;
                        } else {
                            // 移动方块
                            if (positions.farthest.x !== x || positions.farthest.y !== y) {
                                this.grid[positions.farthest.x][positions.farthest.y] = tile;
                                this.grid[x][y] = null;
                                moved = true;
                            }
                        }
                    }
                });
            });
            
            if (moved) {
                this.addRandomTile();
                this.renderGrid();
                
                // 检查游戏是否结束
                if (!this.movesAvailable()) {
                    this.over = true;
                    this.showMessage(false);
                }
            }
        }
        
        // 构建遍历顺序
        buildTraversals(dx, dy) {
            const traversals = {
                x: [],
                y: []
            };
            
            for (let i = 0; i < this.gridSize; i++) {
                traversals.x.push(i);
                traversals.y.push(i);
            }
            
            // 确保正确的遍历顺序
            if (dx === 1) traversals.x = traversals.x.reverse();
            if (dy === 1) traversals.y = traversals.y.reverse();
            
            return traversals;
        }
        
        // 准备方块
        prepareTiles() {
            for (let x = 0; x < this.gridSize; x++) {
                for (let y = 0; y < this.gridSize; y++) {
                    if (this.grid[x][y]) {
                        this.grid[x][y].merged = false;
                    }
                }
            }
        }
        
        // 查找最远位置
        findFarthestPosition(cell, dx, dy) {
            let previous;
            let x = cell.x;
            let y = cell.y;
            
            do {
                previous = { x, y };
                x += dx;
                y += dy;
            } while (this.withinBounds({ x, y }) && !this.grid[x][y]);
            
            return {
                farthest: previous,
                next: this.withinBounds({ x, y }) ? { x, y } : previous
            };
        }
        
        // 检查是否在边界内
        withinBounds(position) {
            return position.x >= 0 && position.x < this.gridSize &&
                   position.y >= 0 && position.y < this.gridSize;
        }
        
        // 检查是否有可用移动
        movesAvailable() {
            return this.availableCells().length > 0 || this.tileMatchesAvailable();
        }
        
        // 检查是否有可合并的方块
        tileMatchesAvailable() {
            for (let x = 0; x < this.gridSize; x++) {
                for (let y = 0; y < this.gridSize; y++) {
                    const tile = this.grid[x][y];
                    
                    if (tile) {
                        // 检查相邻方块
                        for (let direction = 0; direction < 4; direction++) {
                            const vector = this.getVector(direction);
                            const nx = x + vector.x;
                            const ny = y + vector.y;
                            
                            if (this.withinBounds({ x: nx, y: ny })) {
                                const neighbor = this.grid[nx][ny];
                                
                                if (neighbor && neighbor.value === tile.value) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            
            return false;
        }
        
        // 获取方向向量
        getVector(direction) {
            const vectors = [
                { x: 0, y: -1 }, // 左
                { x: 1, y: 0 },  // 下
                { x: 0, y: 1 },  // 右
                { x: -1, y: 0 }  // 上
            ];
            
            return vectors[direction];
        }
        
        // 渲染网格
        renderGrid() {
            this.clearTiles();
            
            for (let x = 0; x < this.gridSize; x++) {
                for (let y = 0; y < this.gridSize; y++) {
                    const tile = this.grid[x][y];
                    
                    if (tile) {
                        const element = document.createElement('div');
                        element.classList.add('tile', `tile-${tile.value}`);
                        if (tile.merged) {
                            element.classList.add('tile-merged');
                        }
                        element.style.top = `${this.getTilePosition(x)}px`;
                        element.style.left = `${this.getTilePosition(y)}px`;
                        
                        this.tileContainer.appendChild(element);
                    }
                }
            }
        }
        
        // 显示游戏消息
        showMessage(won) {
            this.messageContainer.style.display = 'flex';
            
            if (won) {
                this.messageContainer.classList.add('game-won');
                this.messageContainer.querySelector('p').textContent = '你赢了！';
            } else {
                this.messageContainer.classList.add('game-over');
                this.messageContainer.querySelector('p').textContent = '游戏结束！';
            }
        }
        
        // 清除消息
        clearMessage() {
            this.messageContainer.style.display = 'none';
            this.messageContainer.classList.remove('game-won', 'game-over');
        }
        
        // 重新开始游戏
        restart() {
            this.grid = this.createGrid();
            this.score = 0;
            this.won = false;
            this.over = false;
            this.keepPlaying = false;
            
            this.updateScore(0);
            this.clearMessage();
            this.clearTiles();
            
            // 添加初始方块
            for (let i = 0; i < this.startTiles; i++) {
                this.addRandomTile();
            }
        }
    }
    
    // 初始化游戏
    const game = new Game2048();
    
    // 游戏说明按钮
    const howToPlayButton = document.getElementById('how-to-play-button');
    const howToPlaySection = document.querySelector('.how-to-play');
    
    howToPlayButton.addEventListener('click', function() {
        if (howToPlaySection.style.display === 'none' || !howToPlaySection.style.display) {
            howToPlaySection.style.display = 'block';
        } else {
            howToPlaySection.style.display = 'none';
        }
    });
    
    // 初始隐藏游戏说明
    howToPlaySection.style.display = 'none';
});