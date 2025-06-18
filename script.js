class NumGrid {
    constructor() {
        this.grid = document.getElementById('grid');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startButton = document.getElementById('startButton');
        this.gridSizeSelect = document.getElementById('gridSize');
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.selectedTiles = [];
        this.consecutiveMatches = 0;
        this.multiplierTimer = null;
        this.currentMultiplier = 1;
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
        this.gridSizeSelect.addEventListener('change', () => {
            if (this.timer) {
                this.endGame();
            }
        });
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 60;
        this.consecutiveMatches = 0;
        this.currentMultiplier = 1;
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
        this.createGrid();
        this.startPreview();
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
            
            // Reset multiplier after 10 seconds
            this.multiplierTimer = setTimeout(() => {
                this.currentMultiplier = 1;
                this.consecutiveMatches = 0;
            }, 10000);
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
        // Show preview message
        const previewMessage = document.createElement('div');
        previewMessage.className = 'preview-message';
        previewMessage.textContent = 'Memorize the tiles!';
        this.grid.parentElement.insertBefore(previewMessage, this.grid);

        // After 3 seconds, hide the tiles and start the game
        setTimeout(() => {
            previewMessage.remove();
            this.hideAllTiles();
            this.startTimer();
        }, 3000);
    }

    hideAllTiles() {
        this.tiles.forEach(tile => {
            tile.style.backgroundColor = '#34495E';
            tile.textContent = '?';
        });
    }

    handleTileClick(tile) {
        if (this.selectedTiles.length === 2 || 
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

    getExistingNumbers() {
        const existingNumbers = new Set();
        this.tiles.forEach(tile => {
            if (!tile.classList.contains('matched')) {
                existingNumbers.add(parseInt(tile.dataset.number));
            }
        });
        return existingNumbers;
    }

    generateNewTile() {
        const size = parseInt(this.gridSizeSelect.value);
        const totalPairs = (size * size) / 2;
        const existingNumbers = this.getExistingNumbers();
        
        // If there are existing numbers, use one of them
        if (existingNumbers.size > 0) {
            const existingNumber = Array.from(existingNumbers)[Math.floor(Math.random() * existingNumbers.size)];
            const newColor = this.colors[Math.floor(Math.random() * totalPairs)];
            return { number: existingNumber, color: newColor };
        }
        
        // If no existing numbers, generate a new pair
        const newNumber = Math.floor(Math.random() * totalPairs) + 1;
        const newColor = this.colors[Math.floor(Math.random() * totalPairs)];
        return { number: newNumber, color: newColor };
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
            
            // Generate new random tiles
            const newTile1 = this.generateNewTile();
            const newTile2 = this.generateNewTile();
            
            // Update the tiles with new values
            tile1.dataset.number = newTile1.number;
            tile1.dataset.color = newTile1.color;
            tile1.style.backgroundColor = newTile1.color;
            tile1.textContent = newTile1.number;
            
            tile2.dataset.number = newTile2.number;
            tile2.dataset.color = newTile2.color;
            tile2.style.backgroundColor = newTile2.color;
            tile2.textContent = newTile2.number;

            // Hide the tiles after 0.5 seconds
            setTimeout(() => {
                tile1.style.backgroundColor = '#34495E';
                tile1.textContent = '?';
                tile2.style.backgroundColor = '#34495E';
                tile2.textContent = '?';
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
        this.startButton.disabled = false;
        this.gridSizeSelect.disabled = false;
        alert(`Game Over! Your score: ${this.score}`);
    }
}

// Initialize the game
const game = new NumGrid(); 