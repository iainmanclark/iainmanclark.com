class UserProfile {
    constructor() {
        this.userData = this.loadUserData();
        this.updateUI();
    }

    loadUserData() {
        const savedData = localStorage.getItem('codebreaker_user');
        if (savedData) {
            return JSON.parse(savedData);
        }
        return this.createNewUser();
    }

    createNewUser() {
        const userId = 'user_' + Math.random().toString(36).substr(2, 9);
        const newUser = {
            id: userId,
            name: 'Guest',
            level: 1,
            highScore: 0,
            currentScore: 0,
            achievements: [],
            lastPlayed: new Date().toISOString(),
            gamesPlayed: 0,
            totalScore: 0
        };
        this.saveUserData(newUser);
        return newUser;
    }

    saveUserData(data) {
        localStorage.setItem('codebreaker_user', JSON.stringify(data));
    }

    updateUI() {
        document.getElementById('userName').textContent = this.userData.name;
        document.getElementById('userLevel').textContent = `Level ${this.userData.level}`;
        document.getElementById('highScore').textContent = this.userData.highScore;
        document.getElementById('currentScore').textContent = this.userData.currentScore;
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const leaderboard = this.getLeaderboard();
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.highScore}</span>
            `;
            leaderboardList.appendChild(item);
        });
    }

    getLeaderboard() {
        const leaderboardData = localStorage.getItem('codebreaker_leaderboard') || '[]';
        return JSON.parse(leaderboardData);
    }

    updateLeaderboardEntry() {
        let leaderboard = this.getLeaderboard();
        const userEntry = {
            id: this.userData.id,
            name: this.userData.name,
            highScore: this.userData.highScore
        };

        // Update or add user's entry
        const existingIndex = leaderboard.findIndex(entry => entry.id === userEntry.id);
        if (existingIndex !== -1) {
            if (leaderboard[existingIndex].highScore < userEntry.highScore) {
                leaderboard[existingIndex] = userEntry;
            }
        } else {
            leaderboard.push(userEntry);
        }

        // Sort and limit to top 10
        leaderboard.sort((a, b) => b.highScore - a.highScore);
        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem('codebreaker_leaderboard', JSON.stringify(leaderboard));
        this.updateLeaderboard();
    }

    updateScore(points) {
        this.userData.currentScore += points;
        if (this.userData.currentScore > this.userData.highScore) {
            this.userData.highScore = this.userData.currentScore;
            this.updateLeaderboardEntry();
        }
        this.userData.totalScore += points;
        this.saveUserData(this.userData);
        this.updateUI();
    }

    levelUp() {
        this.userData.level++;
        this.saveUserData(this.userData);
        this.updateUI();
    }

    resetCurrentScore() {
        this.userData.currentScore = 0;
        this.saveUserData(this.userData);
        this.updateUI();
    }

    setName(name) {
        this.userData.name = name;
        this.saveUserData(this.userData);
        this.updateUI();
    }

    addAchievement(achievement) {
        if (!this.userData.achievements.includes(achievement)) {
            this.userData.achievements.push(achievement);
            this.saveUserData(this.userData);
            // Trigger achievement notification
            this.showAchievementNotification(achievement);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <i class="fas fa-trophy"></i>
            <span>Achievement Unlocked: ${achievement}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateLevel(newLevel) {
        this.userData.level = newLevel;
        this.saveUserData(this.userData);
        this.updateUI();
    }
}
