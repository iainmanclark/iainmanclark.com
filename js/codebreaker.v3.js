console.log('Loading CodeBreaker v3');

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
        this.canvas.width = 150;
        this.canvas.height = 150;
        
        // Initialize game properties
        this.ctx = this.canvas.getContext('2d');
        this.level = 1;
        this.score = 0;
        this.timeLimit = 10000;
        this.patterns = [];
        this.currentPattern = null;
        this.isPatternVisible = false;
        this.gameState = 'ready';
        this.timeLeft = this.timeLimit / 1000;
        
        // Initialize UI
        this.initializeUI();
        
        // Set up modal elements
        this.nameInputModal = document.getElementById('nameInputModal');
        this.playerNameInput = document.getElementById('playerName');
        this.submitScoreButton = document.getElementById('submitScore');
        
        // Bind submit handler
        if (this.submitScoreButton) {
            this.submitScoreButton.addEventListener('click', () => this.handleScoreSubmit());
        }

        // Load high scores immediately
        this.highScores = this.loadHighScores();
        this.displayHighScores();

        // Set up event listeners
        this.setupEventListeners();
        
        // Draw initial empty state
        this.drawEmptyState();
        
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

        // Clear and initialize pattern options
        const leftOptions = document.getElementById('leftOptions');
        const rightOptions = document.getElementById('rightOptions');
        
        if (leftOptions) {
            leftOptions.innerHTML = '';
            this.createEmptyCanvas(leftOptions);
            this.createEmptyCanvas(leftOptions);
        }
        
        if (rightOptions) {
            rightOptions.innerHTML = '';
            this.createEmptyCanvas(rightOptions);
            this.createEmptyCanvas(rightOptions);
        }
    }

    createEmptyCanvas(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        canvas.className = 'pattern-option';
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a placeholder pattern
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(30, 75);
        ctx.lineTo(120, 75);
        ctx.moveTo(75, 30);
        ctx.lineTo(75, 120);
        ctx.stroke();
        
        container.appendChild(canvas);
    }

    drawEmptyState() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw placeholder pattern
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        // Draw plus sign
        this.ctx.beginPath();
        this.ctx.moveTo(30, this.canvas.height/2);
        this.ctx.lineTo(this.canvas.width - 30, this.canvas.height/2);
        this.ctx.moveTo(this.canvas.width/2, 30);
        this.ctx.lineTo(this.canvas.width/2, this.canvas.height - 30);
        this.ctx.stroke();
        
        // Reset line dash
        this.ctx.setLineDash([]);
    }

    loadHighScores() {
        try {
            const savedScores = localStorage.getItem('highScores');
            if (savedScores) {
                return JSON.parse(savedScores);
            }
        } catch (error) {
            console.error('Error loading high scores:', error);
        }
        return [];
    }

    displayHighScores() {
        const highScoresDiv = document.getElementById('highScores');
        if (!highScoresDiv) return;

        // Create table if it doesn't exist
        let table = highScoresDiv.querySelector('.high-scores-table');
        if (!table) {
            table = document.createElement('table');
            table.className = 'high-scores-table';
            
            // Create header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Level</th>
            `;
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create tbody
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            
            highScoresDiv.appendChild(table);
        }

        // Get tbody
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing scores

        // Sort scores and display top 15
        const sortedScores = [...this.highScores].sort((a, b) => b.score - a.score);
        sortedScores.slice(0, 15).forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.score}</td>
                <td>${score.level}</td>
            `;
            tbody.appendChild(row);
        });
    }

    saveHighScore(name, score, level) {
        try {
            console.log('Saving high score:', { name, score, level });
            this.addHighScore(name, score, level);
        } catch (error) {
            console.error('Error saving high score:', error);
        }
    }

    showNameInputModal() {
        console.log('Showing name input modal');
        if (!this.nameInputModal) {
            console.log(' Name input modal not found');
            return;
        }
        this.nameInputModal.style.display = 'flex';
        if (this.playerNameInput) {
            this.playerNameInput.value = '';
            this.playerNameInput.focus();
        }
    }

    hideNameInputModal() {
        if (this.nameInputModal) {
            this.nameInputModal.style.display = 'none';
        }
    }

    handleScoreSubmit() {
        if (!this.playerNameInput) return;
        
        const playerName = this.playerNameInput.value.trim();
        if (playerName) {
            this.saveHighScore(playerName, this.score, this.level);
            this.hideNameInputModal();
            this.displayHighScores();
            this.initializeUI(); // Reset the game UI
        }
    }

    startGame() {
        console.log('Starting new game...');
        
        // Hide particles
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.style.display = 'none';
        }
        
        // Initialize game state
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.timeLimit = 10000;
        this.isPatternVisible = false;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update UI
        this.updateDisplay();
        
        // Show pause button
        const pauseButton = document.getElementById('pauseGame');
        if (pauseButton) {
            pauseButton.style.display = 'inline-block';
        }
        
        // Start first level
        console.log('Starting first level');
        this.generateNewPattern();
        
        // Update high scores display
        this.updateHighScores();
        
        console.log('Game started successfully');
    }

    endGame() {
        console.log('Game over');
        
        // Show particles
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.style.display = 'block';
        }
        
        this.gameState = 'ready';
        const finalScore = this.score;
        
        // Check if this is a high score
        let isHighScore = this.isHighScore(finalScore);
        
        console.log('Is high score:', isHighScore);
        
        if (isHighScore) {
            console.log('Showing name input for high score');
            this.showNameInputModal();
        } else {
            console.log('Not a high score, showing game over message');
            alert(`Game Over!\n\nFinal Score: ${finalScore}\nLevel Reached: ${this.level}`);
            this.initializeUI();
        }
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        console.log('Game ended successfully');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Start button
        const startButton = document.getElementById('startGame');
        if (startButton) {
            console.log('Found start button, adding click handler');
            startButton.addEventListener('click', () => {
                console.log('Start button clicked');
                this.startGame();
            });
        } else {
            console.error('Start button not found');
        }
        
        // Pause button
        const pauseButton = document.getElementById('pauseGame');
        if (pauseButton) {
            console.log('Found pause button, adding click handler');
            pauseButton.addEventListener('click', () => {
                console.log('Pause button clicked');
                this.togglePause();
            });
        } else {
            console.error('Pause button not found');
        }
        
        // Add touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePatternClick(e.touches[0]);
        });

        // Handle window resize for responsive canvas
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks && navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    generateNewPattern() {
        console.log('Generating new pattern...');
        
        // Clear previous options immediately
        const leftContainer = document.getElementById('leftOptions');
        const rightContainer = document.getElementById('rightOptions');
        if (leftContainer) leftContainer.innerHTML = '';
        if (rightContainer) rightContainer.innerHTML = '';
        
        // Pattern types with increasing complexity based on level
        const patternTypes = [
            'circle', 'square', 'triangle', 'star', 'heart',
            'number', 'symbol', 'letter', 'arrow', 'emoji'
        ];
        
        // Select pattern type based on level
        const availableTypes = Math.min(3 + Math.floor(this.level / 2), patternTypes.length);
        const randomType = patternTypes[Math.floor(Math.random() * availableTypes)];
        
        // Generate the pattern
        this.currentPattern = this.generatePattern(randomType);
        console.log('Generated pattern:', this.currentPattern);
        
        // Draw the pattern
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPattern(this.ctx, this.currentPattern);
        this.isPatternVisible = true;
        
        // Set up timer to hide pattern
        setTimeout(() => {
            console.log('Hiding pattern...');
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.isPatternVisible = false;
            this.gameState = 'guessing';
            
            // Generate options
            this.generateOptions();
            
            // Start timer for this level
            this.startTimer();
        }, 2000);
    }

    generatePattern(type) {
        // Generate 2-4 elements based on level
        const numElements = 2 + Math.floor(Math.random() * (1 + Math.floor(this.level / 3)));
        const elements = [];
        
        for (let i = 0; i < numElements; i++) {
            const element = {
                type: type,
                color: this.getRandomColor(),
                size: 20 + Math.random() * 15, // Smaller size for multiple elements
                x: 30 + Math.random() * (this.canvas.width - 60), // Spread across canvas
                y: 30 + Math.random() * (this.canvas.height - 60),
                rotation: Math.random() * Math.PI * 2,
                details: {}
            };

            switch (type) {
                case 'number':
                    element.details.value = Math.floor(Math.random() * 10);
                    break;
                case 'symbol':
                    const symbols = ['@', '#', '$', '%', '&', '*', '+', '='];
                    element.details.value = symbols[Math.floor(Math.random() * symbols.length)];
                    break;
                case 'letter':
                    element.details.value = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                    break;
                case 'arrow':
                    element.details.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
                    break;
                case 'emoji':
                    const emojis = ['😊', '😎', '🎮', '⭐', '❤️', '🎯', '🎲', '🎪'];
                    element.details.value = emojis[Math.floor(Math.random() * emojis.length)];
                    break;
                case 'star':
                    element.details.points = 5 + Math.floor(Math.random() * 3);
                    break;
                case 'heart':
                    element.details.style = ['filled', 'outlined'][Math.floor(Math.random() * 2)];
                    break;
            }
            
            elements.push(element);
        }

        return {
            type: type,
            elements: elements
        };
    }

    drawPattern(ctx, pattern) {
        pattern.elements.forEach(element => {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate(element.rotation);
            ctx.fillStyle = element.color;
            ctx.strokeStyle = element.color;
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            switch (element.type) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, element.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(-element.size / 2, -element.size / 2, element.size, element.size);
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(0, -element.size / 2);
                    ctx.lineTo(element.size / 2, element.size / 2);
                    ctx.lineTo(-element.size / 2, element.size / 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'star':
                    this.drawStar(ctx, 0, 0, element.details.points, element.size / 2, element.size / 4);
                    break;
                case 'heart':
                    this.drawHeart(ctx, element.size, element.details.style === 'filled');
                    break;
                case 'number':
                case 'symbol':
                case 'letter':
                case 'emoji':
                    ctx.font = `bold ${element.size}px Arial`;
                    ctx.fillText(element.details.value, 0, 0);
                    break;
                case 'arrow':
                    this.drawArrow(ctx, element.size, element.details.direction);
                    break;
            }
            ctx.restore();
        });
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
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
    }

    drawHeart(ctx, size, filled) {
        const width = size;
        const height = size;
        
        ctx.beginPath();
        ctx.moveTo(0, height/4);
        ctx.bezierCurveTo(width/4, -height/4, width, height/4, 0, height);
        ctx.bezierCurveTo(-width, height/4, -width/4, -height/4, 0, height/4);
        
        if (filled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    drawArrow(ctx, size, direction) {
        ctx.beginPath();
        switch (direction) {
            case 'up':
                ctx.moveTo(0, -size/2);
                ctx.lineTo(size/4, 0);
                ctx.lineTo(-size/4, 0);
                break;
            case 'down':
                ctx.moveTo(0, size/2);
                ctx.lineTo(size/4, 0);
                ctx.lineTo(-size/4, 0);
                break;
            case 'left':
                ctx.moveTo(-size/2, 0);
                ctx.lineTo(0, size/4);
                ctx.lineTo(0, -size/4);
                break;
            case 'right':
                ctx.moveTo(size/2, 0);
                ctx.lineTo(0, size/4);
                ctx.lineTo(0, -size/4);
                break;
        }
        ctx.closePath();
        ctx.fill();
    }

    getRandomColor() {
        const colors = [
            '#4CAF50', // Green
            '#2196F3', // Blue
            '#F44336', // Red
            '#FFC107', // Amber
            '#9C27B0', // Purple
            '#FF5722', // Deep Orange
            '#009688', // Teal
            '#673AB7'  // Deep Purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateOptions() {
        try {
            console.log('Generating options...');
            
            // Create array of patterns including the correct one
            const allPatterns = [];
            
            // Add the current pattern
            allPatterns.push(this.currentPattern);
            
            // Generate 3 similar but wrong patterns
            for (let i = 0; i < 3; i++) {
                let wrongPattern = this.generateSimilarPattern(this.currentPattern, i + 1);
                allPatterns.push(wrongPattern);
            }
            
            // Shuffle the patterns
            for (let i = allPatterns.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allPatterns[i], allPatterns[j]] = [allPatterns[j], allPatterns[i]];
            }
            
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
                canvas.width = 150;
                canvas.height = 150;
                canvas.className = 'pattern-option';
                
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw pattern
                this.drawPattern(ctx, pattern);
                
                canvas.addEventListener('click', (event) => {
                    console.log('Pattern option clicked:', pattern);
                    this.handleOptionClick(pattern, event);
                });
                
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

    generateSimilarPattern(originalPattern, difficulty) {
        // Create a deep copy of the original pattern
        const newPattern = {
            type: originalPattern.type,
            elements: JSON.parse(JSON.stringify(originalPattern.elements))
        };

        // Number of elements to modify increases with difficulty
        const numElementsToModify = Math.min(difficulty, newPattern.elements.length);
        
        // Randomly select elements to modify
        const elementsToModify = new Set();
        while (elementsToModify.size < numElementsToModify) {
            elementsToModify.add(Math.floor(Math.random() * newPattern.elements.length));
        }

        // Modify selected elements
        elementsToModify.forEach(index => {
            const element = newPattern.elements[index];
            
            // Randomly choose what to modify
            const modifications = [
                'position',
                'color',
                'size',
                'rotation',
                'details'
            ];

            // Number of modifications increases with level
            const numModifications = 1 + Math.floor(Math.random() * Math.min(2 + Math.floor(this.level / 3), modifications.length));
            
            // Randomly select modifications
            const selectedMods = new Set();
            while (selectedMods.size < numModifications) {
                selectedMods.add(modifications[Math.floor(Math.random() * modifications.length)]);
            }

            selectedMods.forEach(mod => {
                switch (mod) {
                    case 'position':
                        // Slightly move position
                        element.x += (Math.random() - 0.5) * 30;
                        element.y += (Math.random() - 0.5) * 30;
                        // Keep within bounds
                        element.x = Math.max(30, Math.min(this.canvas.width - 30, element.x));
                        element.y = Math.max(30, Math.min(this.canvas.height - 30, element.y));
                        break;

                    case 'color':
                        // Similar but different color
                        const color = element.color.match(/\d+/g).map(Number);
                        color[Math.floor(Math.random() * 3)] += Math.floor((Math.random() - 0.5) * 50);
                        color[0] = Math.max(0, Math.min(255, color[0]));
                        color[1] = Math.max(0, Math.min(255, color[1]));
                        color[2] = Math.max(0, Math.min(255, color[2]));
                        element.color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                        break;

                    case 'size':
                        // Slightly change size
                        element.size *= 0.8 + Math.random() * 0.4; // 80% to 120% of original size
                        break;

                    case 'rotation':
                        // Slightly rotate
                        element.rotation += (Math.random() - 0.5) * Math.PI / 2;
                        break;

                    case 'details':
                        // Modify type-specific details
                        switch (element.type) {
                            case 'number':
                                element.details.value = (element.details.value + 1 + Math.floor(Math.random() * 8)) % 10;
                                break;
                            case 'symbol':
                                const symbols = ['@', '#', '$', '%', '&', '*', '+', '='];
                                let currentIndex = symbols.indexOf(element.details.value);
                                currentIndex = (currentIndex + 1 + Math.floor(Math.random() * (symbols.length - 1))) % symbols.length;
                                element.details.value = symbols[currentIndex];
                                break;
                            case 'letter':
                                let charCode = element.details.value.charCodeAt(0);
                                charCode = ((charCode - 65 + 1 + Math.floor(Math.random() * 24)) % 26) + 65;
                                element.details.value = String.fromCharCode(charCode);
                                break;
                            case 'arrow':
                                const directions = ['up', 'down', 'left', 'right'];
                                let dirIndex = directions.indexOf(element.details.direction);
                                dirIndex = (dirIndex + 1 + Math.floor(Math.random() * 2)) % 4;
                                element.details.direction = directions[dirIndex];
                                break;
                            case 'emoji':
                                const emojis = ['😊', '😎', '🎮', '⭐', '❤️', '🎯', '🎲', '🎪'];
                                let emojiIndex = emojis.indexOf(element.details.value);
                                emojiIndex = (emojiIndex + 1 + Math.floor(Math.random() * (emojis.length - 1))) % emojis.length;
                                element.details.value = emojis[emojiIndex];
                                break;
                            case 'star':
                                element.details.points = 5 + ((element.details.points - 4) % 3);
                                break;
                            case 'heart':
                                element.details.style = element.details.style === 'filled' ? 'outlined' : 'filled';
                                break;
                        }
                        break;
                }
            });
        });

        return newPattern;
    }

    handleOptionClick(selectedPattern, event) {
        if (this.gameState !== 'guessing') {
            console.log('Not in guessing state');
            return;
        }
        
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Compare patterns
        const isCorrect = this.comparePatterns(selectedPattern, this.currentPattern);
        
        // Get clicked canvas element
        const clickedCanvas = event.target;
        if (clickedCanvas) {
            // Remove any existing animation classes
            clickedCanvas.classList.remove('correct', 'wrong');
            
            // Add appropriate animation class
            clickedCanvas.classList.add(isCorrect ? 'correct' : 'wrong');
            
            // Remove class after animation
            setTimeout(() => {
                clickedCanvas.classList.remove('correct', 'wrong');
            }, 1000);
        }
        
        if (isCorrect) {
            // Calculate score based on remaining time and level
            const timeBonus = Math.floor(this.timeLeft / 100);
            const levelBonus = this.level * 10;
            const roundScore = timeBonus + levelBonus;
            this.score += roundScore;
            
            // Update level and proceed to next pattern
            this.level++;
            this.timeLimit = Math.max(3000, 10000 - (this.level * 500)); // Decrease time limit with level
            
            // Show success message
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Correct!', this.canvas.width/2, this.canvas.height/2);
            
            // Update display
            this.updateDisplay();
            
            // Generate new pattern after a short delay
            setTimeout(() => {
                this.generateNewPattern();
            }, 1000);
        } else {
            this.endGame();
        }
    }

    comparePatterns(pattern1, pattern2) {
        if (pattern1.type !== pattern2.type || pattern1.elements.length !== pattern2.elements.length) {
            return false;
        }

        // Sort elements by x position for consistent comparison
        const elements1 = [...pattern1.elements].sort((a, b) => a.x - b.x);
        const elements2 = [...pattern2.elements].sort((a, b) => a.x - b.x);

        // Compare each element
        return elements1.every((elem1, index) => {
            const elem2 = elements2[index];
            return this.compareElements(elem1, elem2);
        });
    }

    compareElements(elem1, elem2) {
        // Basic properties
        if (elem1.type !== elem2.type ||
            elem1.color !== elem2.color ||
            Math.abs(elem1.size - elem2.size) > 1 ||
            Math.abs(elem1.x - elem2.x) > 1 ||
            Math.abs(elem1.y - elem2.y) > 1 ||
            Math.abs(elem1.rotation - elem2.rotation) > 0.1) {
            return false;
        }

        // Compare details based on type
        switch (elem1.type) {
            case 'number':
            case 'symbol':
            case 'letter':
            case 'emoji':
                return elem1.details.value === elem2.details.value;
            case 'arrow':
                return elem1.details.direction === elem2.details.direction;
            case 'star':
                return elem1.details.points === elem2.details.points;
            case 'heart':
                return elem1.details.style === elem2.details.style;
            default:
                return true;
        }
    }

    startTimer() {
        console.log('Starting timer...');
        let timeLeft = this.timeLimit / 1000;
        
        // Update display
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            timeDisplay.textContent = timeLeft;
        }
        
        // Clear any existing timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Start new timer
        this.timer = setInterval(() => {
            timeLeft--;
            this.timeLeft = timeLeft;
            
            if (timeDisplay) {
                timeDisplay.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.endGame();
            }
        }, 1000);
    }

    updateDisplay() {
        const levelDisplay = document.getElementById('levelDisplay');
        const scoreDisplay = document.getElementById('scoreDisplay');
        
        if (levelDisplay) levelDisplay.textContent = this.level;
        if (scoreDisplay) scoreDisplay.textContent = this.score;
    }

    updateHighScores() {
        const highScoresDiv = document.getElementById('highScores');
        if (!highScoresDiv) return;

        // Clear existing content except the title
        while (highScoresDiv.lastChild) {
            if (highScoresDiv.lastChild.tagName === 'H3') break;
            highScoresDiv.removeChild(highScoresDiv.lastChild);
        }

        // Create table
        const table = document.createElement('table');
        table.className = 'high-scores-table';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Rank', 'Name', 'Score', 'Level'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        this.highScores.slice(0, 15).forEach((score, index) => {
            const row = document.createElement('tr');
            
            // Rank cell
            const rankCell = document.createElement('td');
            rankCell.textContent = `${index + 1}`;
            row.appendChild(rankCell);
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = score.name || 'Anonymous';
            row.appendChild(nameCell);
            
            // Score cell
            const scoreCell = document.createElement('td');
            scoreCell.textContent = score.score;
            row.appendChild(scoreCell);
            
            // Level cell
            const levelCell = document.createElement('td');
            levelCell.textContent = score.level;
            row.appendChild(levelCell);
            
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Add table to high scores div
        highScoresDiv.appendChild(table);
    }

    isHighScore(score) {
        return this.highScores.length < 15 || score > this.highScores[14]?.score;
    }

    addHighScore(name, score, level) {
        this.highScores.push({ name, score, level });
        this.highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 15 scores
        if (this.highScores.length > 15) {
            this.highScores = this.highScores.slice(0, 15);
        }
        
        // Save to localStorage
        localStorage.setItem('highScores', JSON.stringify(this.highScores));
        
        // Update display
        this.updateHighScores();
    }

    togglePause() {
        // TODO: Implement pause functionality
        console.log('Pause toggled');
    }

    handleResize() {
        // Adjust canvas size based on screen width
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const newSize = Math.min(window.innerWidth - 40, 300);
            this.canvas.width = newSize;
            this.canvas.height = newSize;
        } else {
            this.canvas.width = 150;
            this.canvas.height = 150;
        }

        // Redraw current state
        if (this.currentPattern) {
            this.drawPattern(this.currentPattern);
        } else {
            this.drawEmptyState();
        }
    }

    handlePatternClick(event) {
        if (this.gameState !== 'playing') return;

        const rect = event.target.getBoundingClientRect();
        const x = (event.clientX || event.touches[0].clientX) - rect.left;
        const y = (event.clientY || event.touches[0].clientY) - rect.top;
        
        // Scale coordinates based on canvas size
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.checkPattern(x * scaleX, y * scaleY);
    }
}
