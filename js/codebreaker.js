console.log('Loading new version of CodeBreaker - v2');

class CodeBreaker {
    constructor(canvasId) {
        console.log('Initializing CodeBreaker with canvas ID:', canvasId);
        
        // Initialize properties
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        this.ctx = this.canvas.getContext('2d');
        this.level = 1;
        this.score = 0;
        this.timeLimit = 10000; // Increased to 10 seconds
        this.patterns = [];
        this.currentPattern = null;
        this.isPatternVisible = false;
        this.gameState = 'ready';
        
        // Initialize UI
        this.initializeUI();
        
        // Load high scores
        this.highScores = this.loadHighScores();
        this.updateHighScoresList();
        
        this.setupEventListeners();
        console.log('Initial setup complete');
    }

    initializeUI() {
        // Set up game buttons
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.style.display = 'block';
            startButton.textContent = 'Start New Game';
        }

        const pauseButton = document.getElementById('pauseGame');
        if (pauseButton) {
            pauseButton.style.display = 'none';
        }

        // Clear pattern options
        const leftOptions = document.getElementById('leftOptions');
        const rightOptions = document.getElementById('rightOptions');
        if (leftOptions) leftOptions.innerHTML = '';
        if (rightOptions) rightOptions.innerHTML = '';

        // Show particles if they exist
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.style.display = 'block';
        }
    }

    loadHighScores() {
        const scores = localStorage.getItem('codebreaker_highscores');
        return scores ? JSON.parse(scores) : [];
    }

    saveHighScores() {
        localStorage.setItem('codebreaker_highscores', JSON.stringify(this.highScores));
    }

    updateHighScoresList() {
        const container = document.getElementById('highScoresList');
        if (!container) return;

        container.innerHTML = '';
        
        // Sort scores in descending order
        this.highScores.sort((a, b) => b.score - a.score);
        
        // Show top 10 scores
        this.highScores.slice(0, 10).forEach(score => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'high-score-item';
            scoreItem.innerHTML = `
                <span class="high-score-name">${score.name}</span>
                <span class="high-score-score">${score.score}</span>
            `;
            container.appendChild(scoreItem);
        });
    }

    checkHighScore(score) {
        // Check if this score would make it into the top 10
        const lowestScore = this.highScores.length >= 10 ? 
            Math.min(...this.highScores.map(s => s.score)) : 0;
        
        return this.highScores.length < 10 || score > lowestScore;
    }

    async addHighScore(score) {
        const name = prompt('Congratulations! You made the high score list!\nEnter your name:');
        if (name) {
            this.highScores.push({ name, score });
            this.highScores.sort((a, b) => b.score - a.score);
            
            // Keep only top 10
            if (this.highScores.length > 10) {
                this.highScores = this.highScores.slice(0, 10);
            }
            
            this.saveHighScores();
            this.updateHighScoresList();
        }
    }

    initializeGame() {
        try {
            // Initialize user profile
            this.userProfile = new UserProfile();
            this.score = this.userProfile.userData.currentScore;
            this.level = this.userProfile.userData.level;
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize canvas
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error during game initialization:', error);
        }
    }

    setupEventListeners() {
        // Canvas click handler
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Start button
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('Start button clicked');
                this.startGame();
            });
        }
        
        // Pause button
        const pauseButton = document.getElementById('pauseGame');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => this.togglePause());
        }
    }

    handleClick(event) {
        if (this.gameState === 'ready') {
            this.startGame();
        }
    }

    startGame() {
        console.log('Starting game...');
        try {
            // Update UI elements
            const startButton = document.getElementById('startGame');
            const pauseButton = document.getElementById('pauseGame');
            const particlesContainer = document.getElementById('particles-js');
            
            if (startButton) startButton.style.display = 'none';
            if (pauseButton) pauseButton.style.display = 'block';
            if (particlesContainer) particlesContainer.style.display = 'none';
            
            // Reset game state
            this.level = 1;
            this.score = 0;
            this.timeLimit = 10000;
            this.gameState = 'ready';
            this.isPatternVisible = false;
            
            // Clear and resize canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.resizeCanvas();
            
            // Start first level
            this.startLevel();
            
            console.log('Game started successfully');
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    async startLevel() {
        try {
            // Clear previous options immediately
            const leftContainer = document.getElementById('leftOptions');
            const rightContainer = document.getElementById('rightOptions');
            
            if (leftContainer) leftContainer.innerHTML = '';
            if (rightContainer) rightContainer.innerHTML = '';

            this.gameState = 'showing';
            this.isPatternVisible = true;
            this.remainingTime = this.timeLimit;
            
            // Generate the main pattern first
            this.currentPattern = this.generatePattern();
            console.log('Generated pattern:', this.currentPattern); // Debug log
            
            if (!this.currentPattern) {
                console.error('Failed to generate pattern');
                return;
            }
            
            // Draw the initial pattern
            this.drawGrid();
            
            // Show pattern for 2 seconds
            setTimeout(() => {
                this.isPatternVisible = false;
                this.drawGrid();
                
                // Generate options after pattern is hidden
                this.generateOptions();
                
                this.gameState = 'guessing';
                this.startTimer();
            }, 2000);
            
        } catch (error) {
            console.error('Error starting level:', error);
        }
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        const timerDisplay = document.getElementById('timeDisplay');
        this.remainingTime = this.timeLimit / 1000;
        
        this.timer = setInterval(() => {
            this.remainingTime--;
            if (timerDisplay) {
                timerDisplay.textContent = Math.max(0, Math.ceil(this.remainingTime));
            }
            
            if (this.remainingTime <= 0) {
                clearInterval(this.timer);
                this.handleTimeout();
            }
        }, 1000);
    }

    handleTimeout() {
        if (this.gameState === 'guessing') {
            this.gameOver();
        }
    }

    gameOver() {
        try {
            // Update UI elements
            const startButton = document.getElementById('startGame');
            const pauseButton = document.getElementById('pauseGame');
            const particlesContainer = document.getElementById('particles-js');
            
            if (startButton) {
                startButton.style.display = 'block';
                startButton.textContent = 'Play Again';
            }
            if (pauseButton) pauseButton.style.display = 'none';
            if (particlesContainer) particlesContainer.style.display = 'block';
            
            // Clear timer if exists
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            
            // Show game over message
            const finalScore = this.score;
            const finalLevel = this.level;
            
            alert(`Game Over!\n\nFinal Score: ${finalScore}\nLevel Reached: ${finalLevel}`);
            
            // Reset game state
            this.gameState = 'gameover';
            this.level = 1;
            this.score = 0;
            
            // Clear canvas and options
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const leftContainer = document.getElementById('leftOptions');
            const rightContainer = document.getElementById('rightOptions');
            if (leftContainer) leftContainer.innerHTML = '';
            if (rightContainer) rightContainer.innerHTML = '';
            
            this.updateDisplay();
        } catch (error) {
            console.error('Error in gameOver:', error);
        }
    }

    updateDisplay() {
        const levelDisplay = document.getElementById('levelDisplay');
        const scoreDisplay = document.getElementById('scoreDisplay');
        
        if (levelDisplay) levelDisplay.textContent = this.level;
        if (scoreDisplay) scoreDisplay.textContent = this.score;
    }

    generateOptions() {
        try {
            // Get the current pattern type
            const patternType = this.currentPattern[0].type;
            
            // Generate three wrong patterns of the same type
            const wrongPatterns = [];
            for (let i = 0; i < 3; i++) {
                let wrongPattern;
                do {
                    wrongPattern = this.generatePattern(patternType);
                } while (
                    JSON.stringify(wrongPattern) === JSON.stringify(this.currentPattern) ||
                    wrongPatterns.some(p => JSON.stringify(p) === JSON.stringify(wrongPattern))
                );
                wrongPatterns.push(wrongPattern);
            }

            // Combine with correct pattern and shuffle
            const allPatterns = [this.currentPattern, ...wrongPatterns];
            for (let i = allPatterns.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allPatterns[i], allPatterns[j]] = [allPatterns[j], allPatterns[i]];
            }

            // Split into left and right options
            const leftContainer = document.getElementById('leftOptions');
            const rightContainer = document.getElementById('rightOptions');
            
            if (!leftContainer || !rightContainer) {
                console.error('Option containers not found');
                return;
            }

            leftContainer.innerHTML = '';
            rightContainer.innerHTML = '';

            // Create canvases for each pattern
            allPatterns.forEach((pattern, index) => {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
                canvas.className = 'pattern-option';
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.error('Failed to get canvas context');
                    return;
                }

                this.drawPattern(ctx, pattern);
                
                canvas.addEventListener('click', () => this.handleOptionClick(pattern));
                
                if (index < 2) {
                    leftContainer.appendChild(canvas);
                } else {
                    rightContainer.appendChild(canvas);
                }
            });
        } catch (error) {
            console.error('Error generating options:', error);
        }
    }

    generatePattern(forcedType = null) {
        const numElements = Math.min(3 + Math.floor(this.level / 2), 8);
        const pattern = [];
        const minDistance = 40; // Minimum distance between elements
        
        // Define pattern types
        const types = ['number', 'color', 'shape'];
        const patternType = forcedType || types[Math.floor(Math.random() * types.length)];
        
        for (let i = 0; i < numElements; i++) {
            let x, y, tooClose;
            do {
                x = Math.random() * (this.canvas.width - 60) + 30;
                y = Math.random() * (this.canvas.height - 60) + 30;
                tooClose = pattern.some(element => {
                    const dx = x - element.x;
                    const dy = y - element.y;
                    return Math.sqrt(dx * dx + dy * dy) < minDistance;
                });
            } while (tooClose);

            let element;
            switch (patternType) {
                case 'number':
                    element = {
                        type: 'number',
                        value: Math.floor(Math.random() * 10),
                        x: x,
                        y: y
                    };
                    break;
                case 'color':
                    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
                    element = {
                        type: 'color',
                        value: colors[Math.floor(Math.random() * colors.length)],
                        x: x,
                        y: y
                    };
                    break;
                case 'shape':
                    const shapes = ['circle', 'square', 'triangle', 'star'];
                    element = {
                        type: 'shape',
                        value: shapes[Math.floor(Math.random() * shapes.length)],
                        x: x,
                        y: y
                    };
                    break;
            }
            pattern.push(element);
        }
        
        return pattern;
    }

    drawPattern(ctx, pattern) {
        if (!pattern || !Array.isArray(pattern)) {
            console.error('Invalid pattern:', pattern);
            return;
        }

        try {
            // Clear the canvas first
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Draw each element in the pattern array
            pattern.forEach(element => {
                if (!element || !element.x || !element.y || !element.type) {
                    console.error('Invalid element:', element);
                    return;
                }

                const x = element.x;
                const y = element.y;
                const elementSize = 30; // Base size for elements

                ctx.save(); // Save context state
                
                switch(element.type) {
                    case 'number':
                        ctx.font = `${elementSize}px Arial`;
                        ctx.fillStyle = '#000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(element.value.toString(), x, y);
                        break;
                    case 'color':
                        ctx.fillStyle = element.value;
                        ctx.beginPath();
                        ctx.arc(x, y, elementSize/2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#000';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        break;
                    case 'shape':
                        ctx.fillStyle = '#000';
                        this.drawMiniShape(ctx, element.value, x, y, elementSize/2);
                        break;
                }
                
                ctx.restore(); // Restore context state
            });
        } catch (error) {
            console.error('Error in drawPattern:', error);
        }
    }

    drawMiniShape(ctx, shape, x, y, size) {
        try {
            switch(shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(x - size, y - size, size * 2, size * 2);
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(x, y - size);
                    ctx.lineTo(x + size, y + size);
                    ctx.lineTo(x - size, y + size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'star':
                    this.drawMiniStar(ctx, x, y, 5, size, size/2);
                    break;
            }
        } catch (error) {
            console.error('Error drawing mini shape:', error);
        }
    }

    drawMiniStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        try {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            
            for(let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
        } catch (error) {
            console.error('Error drawing mini star:', error);
        }
    }

    drawGrid() {
        try {
            // Clear the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw the current pattern if it's visible
            if (this.isPatternVisible && this.currentPattern) {
                console.log('Drawing pattern:', this.currentPattern);
                this.drawPattern(this.ctx, this.currentPattern);
            }
            
        } catch (error) {
            console.error('Error in drawGrid:', error);
        }
    }

    drawLevel() {
        // Draw level text in the top-right corner
        this.ctx.save();
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Level: ${this.level}`, this.canvas.width - 10, 10);
        this.ctx.restore();
    }

    handleOptionClick(selectedPattern) {
        if (this.gameState !== 'guessing') return;
        
        const isCorrect = JSON.stringify(selectedPattern) === JSON.stringify(this.currentPattern);
        
        if (isCorrect) {
            // Calculate points
            const timeBonus = Math.ceil(this.remainingTime);
            const levelBonus = this.level * 10;
            const points = timeBonus + levelBonus;
            
            // Update score and level
            this.updateScore(this.score + points);
            this.levelUp();
            this.updateDisplay();
            
            // Clear timer and options
            if (this.timer) {
                clearInterval(this.timer);
            }
            
            const leftContainer = document.getElementById('leftOptions');
            const rightContainer = document.getElementById('rightOptions');
            
            if (leftContainer) leftContainer.innerHTML = '';
            if (rightContainer) rightContainer.innerHTML = '';
            
            // Start next level immediately
            this.startLevel();
        } else {
            // Game Over
            if (this.timer) {
                clearInterval(this.timer);
            }
            
            // Clear options
            const leftContainer = document.getElementById('leftOptions');
            const rightContainer = document.getElementById('rightOptions');
            
            if (leftContainer) leftContainer.innerHTML = '';
            if (rightContainer) rightContainer.innerHTML = '';
            
            const finalScore = this.score;
            
            // Check for high score before resetting
            const isHighScore = this.checkHighScore(finalScore);
            
            // Handle high score if achieved
            if (isHighScore) {
                this.addHighScore(finalScore);
            }
            
            // Reset game state
            this.gameState = 'gameover';
            this.level = 1;
            this.score = 0;
            this.updateDisplay();
            
            // Show game over screen
            this.showGameOver();
        }
    }

    showGameOver() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game over message
        this.ctx.fillStyle = '#333';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Game Over', this.canvas.width/2, this.canvas.height/2 - 30);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Click anywhere to play again', this.canvas.width/2, this.canvas.height/2 + 30);
        
        // Add click listener for restart
        const restartHandler = (e) => {
            this.canvas.removeEventListener('click', restartHandler);
            this.startLevel();
        };
        this.canvas.addEventListener('click', restartHandler);
    }

    updateScore(newScore) {
        this.score = newScore;
        if (this.userProfile) {
            this.userProfile.updateScore(newScore);
            // Save level progress
            this.userProfile.updateLevel(this.level);
        }
    }

    levelUp() {
        this.level++;
        if (this.userProfile) {
            this.userProfile.updateLevel(this.level);
        }
        this.timeLimit = Math.max(3000, 10000 - (this.level * 500)); // Adjust time limit based on level
        this.drawLevel();
    }

    increaseLevel() {
        this.level++;
        console.log('Increasing to level:', this.level);
        
        // Adjust time limit based on level
        // Start at 10s, decrease by 0.1s per level, minimum 1.5s
        this.timeLimit = Math.max(1500, 10000 - (this.level - 1) * 100);
        console.log('New time limit:', this.timeLimit);
    }

    resizeCanvas() {
        try {
            const container = this.canvas.parentElement;
            const size = Math.min(container.clientWidth, container.clientHeight);
            this.canvas.width = size;
            this.canvas.height = size;
            this.updateCellSize();
            this.drawGrid();
        } catch (error) {
            console.error('Error resizing canvas:', error);
        }
    }

    updateCellSize() {
        // Calculate cell size based on current grid size
        this.cellSize = Math.floor(this.canvas.width / this.gridSize);
    }

    togglePause() {
        // TODO: Implement pause functionality
    }
}
