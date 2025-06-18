class NumGrid {
    constructor() {
        this.grid = document.getElementById('grid');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startButton = document.getElementById('startButton');
        this.newGameButton = document.getElementById('newGameButton');
        this.gridSizeSelect = document.getElementById('gridSize');
        this.titleScreen = document.getElementById('titleScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.selectedTiles = [];
        this.consecutiveMatches = 0;
        this.multiplierTimer = null;
        this.currentMultiplier = 1;
        this.isPreviewMode = false;
        this.isGameOver = false;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
            '#E74C3C', '#2ECC71', '#F1C40F', '#1ABC9C',
            '#E67E22', '#34495E', '#16A085', '#8E44AD',
            '#C0392B', '#27AE60', '#2980B9', '#8E44AD',
            '#2C3E50', '#E74C3C', '#1ABC9C', '#F39C12',
            '#D35400', '#27AE60', '#8E44AD', '#2C3E50',
            '#E74C3C', '#1ABC9C', '#F39C12', '#D35400',
            '#27AE60', '#8E44AD', '#2C3E50', '#E74C3C',
            '#1ABC9C', '#F39C12', '#D35400', '#27AE60',
            '#8E44AD', '#2C3E50', '#E74C3C', '#1ABC9C',
            '#F39C12', '#D35400', '#27AE60', '#8E44AD',
            '#2C3E50', '#E74C3C'
        ];
        this.tiles = [];
        
        this.startButton.addEventListener('click', () => this.startGame());
        this.newGameButton.addEventListener('click', () => this.returnToTitle());
        this.gridSizeSelect.addEventListener('change', () => {
            if (this.timer) {
                this.endGame();
            }
        });
    }

    getTimeForGridSize(size) {
        switch (size) {
            case 2: return 10;  // 2x2: 10 seconds
            case 4: return 20;  // 4x4: 20 seconds
            case 6: return 60;  // 6x6: 60 seconds
            case 8: return 90;  // 8x8: 90 seconds
            case 10: return 120; // 10x10: 120 seconds
            default: return 60;
        }
    }

    startGame() {
        this.score = 0;
        const size = parseInt(this.gridSizeSelect.value);
        this.timeLeft = this.getTimeForGridSize(size);
        this.consecutiveMatches = 0;
        this.currentMultiplier = 1;
        this.isGameOver = false;
        this.scoreElement.textContent = this.score;
        this.timerElement.textContent = this.timeLeft;
        this.startButton.disabled = true;
        this.gridSizeSelect.disabled = true;
        this.grid.innerHTML = '';
        this.tiles = [];
        if (this.multiplierTimer) {
            clearTimeout(this.multiplierTimer);
            this.multiplierTimer = null;
        }
        
        // Show game screen, hide title screen
        this.titleScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        this.createGrid();
        this.startPreview();
    }

    returnToTitle() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (this.multiplierTimer) {
            clearTimeout(this.multiplierTimer);
        }
        this.isGameOver = true;
        this.startButton.disabled = false;
        this.gridSizeSelect.disabled = false;
        
        // Show title screen, hide game screen
        this.titleScreen.style.display = 'block';
        this.gameScreen.style.display = 'none';
    }

    updateMultiplier() {
        // Calculate multiplier based on consecutive matches
        const newMultiplier = Math.floor(this.consecutiveMatches / 5) + 1;
        
        if (newMultiplier > this.currentMultiplier) {
            this.currentMultiplier = newMultiplier;
            // Show multiplier message
            const multiplierMessage = document.createElement('div');
            multiplierMessage.className = 'multiplier-message';
            multiplierMessage.textContent = `${this.currentMultiplier}x Points!`;
            this.grid.parentElement.insertBefore(multiplierMessage, this.grid);
            
            // Remove message after 2 seconds
            setTimeout(() => multiplierMessage.remove(), 2000);
        }
    }

    addTime() {
        const timeBonus = Math.floor(this.consecutiveMatches / 5) + 1;
        this.timeLeft += timeBonus;
        this.timerElement.textContent = this.timeLeft;
        
        // Show time bonus message
        const timeMessage = document.createElement('div');
        timeMessage.className = 'time-message';
        timeMessage.textContent = `+${timeBonus}s`;
        this.grid.parentElement.insertBefore(timeMessage, this.grid);
        
        // Remove message after 1 second
        setTimeout(() => timeMessage.remove(), 1000);
    }

    createGrid() {
        const size = parseInt(this.gridSizeSelect.value);
        this.grid.dataset.size = size;
        const totalPairs = (size * size) / 2;
        
        // Create pairs of numbers with matching colors
        const pairs = [];
        for (let i = 0; i < totalPairs; i++) {
            pairs.push({ number: i + 1, color: this.colors[i] });
            pairs.push({ number: i + 1, color: this.colors[i] });
        }
        
        // Shuffle the pairs
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        // Create tiles
        for (let i = 0; i < size * size; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.number = pairs[i].number;
            tile.dataset.color = pairs[i].color;
            tile.style.backgroundColor = pairs[i].color;
            tile.textContent = pairs[i].number;
            tile.addEventListener('click', () => this.handleTileClick(tile));
            this.grid.appendChild(tile);
            this.tiles.push(tile);
        }
    }

    startPreview() {
        this.isPreviewMode = true;
        // Show preview message
        const previewMessage = document.createElement('div');
        previewMessage.className = 'preview-message';
        previewMessage.textContent = 'Memorize the tiles!';
        this.grid.parentElement.insertBefore(previewMessage, this.grid);

        // Calculate preview time based on grid size
        const size = parseInt(this.gridSizeSelect.value);
        let previewTime = 3000; // Default 3 seconds for 2x2 and 4x4
        if (size === 6 || size === 8) {
            previewTime = 6000; // 6 seconds for 6x6 and 8x8
        } else if (size === 10) {
            previewTime = 10000; // 10 seconds for 10x10
        }

        // After preview time, hide the tiles and start the game
        setTimeout(() => {
            previewMessage.remove();
            this.hideAllTiles();
            this.startTimer();
            this.isPreviewMode = false;
        }, previewTime);
    }

    hideAllTiles() {
        this.tiles.forEach(tile => {
            tile.style.backgroundColor = '#34495E';
            tile.textContent = '?';
        });
    }

    handleTileClick(tile) {
        if (this.isPreviewMode || 
            this.isGameOver ||
            this.selectedTiles.length === 2 || 
            tile.classList.contains('matched') || 
            tile.classList.contains('selected')) {
            return;
        }

        // Reveal the tile
        tile.classList.add('selected');
        tile.style.backgroundColor = tile.dataset.color;
        tile.textContent = tile.dataset.number;
        this.selectedTiles.push(tile);

        if (this.selectedTiles.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const [tile1, tile2] = this.selectedTiles;
        const match = tile1.dataset.number === tile2.dataset.number && 
                     tile1.dataset.color === tile2.dataset.color;

        if (match) {
            // Update consecutive matches and multiplier
            this.consecutiveMatches++;
            this.updateMultiplier();
            
            // Add score with multiplier
            this.score += this.currentMultiplier;
            this.scoreElement.textContent = this.score;
            
            // Add time bonus
            this.addTime();
            
            // Mark tiles as matched and make them invisible
            tile1.classList.add('matched');
            tile2.classList.add('matched');
            
            // Animate tiles becoming invisible
            setTimeout(() => {
                tile1.style.opacity = '0';
                tile2.style.opacity = '0';
                
                // Check if all tiles are matched
                this.checkBoardComplete();
            }, 500);
        } else {
            // Reset consecutive matches on failure
            this.consecutiveMatches = 0;
            this.currentMultiplier = 1;
            if (this.multiplierTimer) {
                clearTimeout(this.multiplierTimer);
                this.multiplierTimer = null;
            }
            
            // Hide the tiles after 0.5 seconds
            setTimeout(() => {
                tile1.style.backgroundColor = '#34495E';
                tile1.textContent = '?';
                tile2.style.backgroundColor = '#34495E';
                tile2.textContent = '?';
            }, 500);
        }

        // Clear selection immediately to allow new matches
        tile1.classList.remove('selected');
        tile2.classList.remove('selected');
        this.selectedTiles = [];
    }

    checkBoardComplete() {
        // Check if all tiles are matched
        const remainingTiles = this.grid.querySelectorAll('.tile:not(.matched)');
        if (remainingTiles.length === 0) {
            // Add board clear bonus
            this.score += 10;
            this.scoreElement.textContent = this.score;
            
            // Show board clear message
            const clearMessage = document.createElement('div');
            clearMessage.className = 'clear-message';
            clearMessage.textContent = 'Board Clear! +10 points';
            this.grid.parentElement.insertBefore(clearMessage, this.grid);
            
            // Remove message after 2 seconds
            setTimeout(() => clearMessage.remove(), 2000);
            
            // Pause the timer
            clearInterval(this.timer);
            
            // Create new board
            this.grid.innerHTML = '';
            this.tiles = [];
            this.createGrid();
            this.startPreview();
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        clearInterval(this.timer);
        if (this.multiplierTimer) {
            clearTimeout(this.multiplierTimer);
        }
        this.isGameOver = true;
        this.startButton.disabled = false;
        this.gridSizeSelect.disabled = false;

        // Reveal all remaining unmatched tiles
        const remainingTiles = this.grid.querySelectorAll('.tile:not(.matched)');
        remainingTiles.forEach(tile => {
            tile.style.backgroundColor = tile.dataset.color;
            tile.textContent = tile.dataset.number;
            // Add a slight delay between each tile reveal for a nice effect
            setTimeout(() => {
                tile.style.opacity = '0.7';  // Make it slightly transparent to indicate it's not matched
            }, 100);
        });

        alert(`Game Over! Your score: ${this.score}`);
    }
}

// Initialize the game
const game = new NumGrid(); 