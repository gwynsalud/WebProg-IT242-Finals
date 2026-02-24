/**
 * bouncer.js
 * Extends the global rootConfig with Tavern Patrol game logic.
 * Features: Aggressive score-based scaling (every 100pts) & Level Up alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.rootConfig) {
        console.error("Global rootConfig not found. Make sure main.js is loaded before bouncer.js.");
        return;
    }

    const { createApp } = Vue;

    const gameData = {
        gameActive: false,
        gameScore: 0,
        gameLives: 3,
        difficulty: 1.0,
        currentLevel: 1,
        showLevelUp: false,
        activeNPCs: [],
        npcIdCounter: 0,
        gameLoopInterval: null,
        spawnRate: 0.03,
        stageWidth: 1000 
    };

    const gameMethods = {
        startBouncerGame() {
            this.gameScore = 0;
            this.gameLives = 3;
            this.difficulty = 1.0;
            this.currentLevel = 1;
            this.activeNPCs = [];
            this.gameActive = true;

            if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);

            this.gameLoopInterval = setInterval(() => {
                if (this.gameActive && !this.isPaused) {
                    this.updateGame();
                }
            }, 30);
        },

        updateGame() {
            // 1. AGGRESSIVE SCALING: Speed increases every 100 points
            const newLevel = Math.floor(this.gameScore / 100) + 1;
            
            if (newLevel > this.currentLevel) {
                this.triggerLevelUp(newLevel);
            }

            // Difficulty formula: Base + (Level-1) * 0.25 (e.g., Level 5 is 2x speed)
            this.difficulty = 1 + (this.currentLevel - 1) * 0.25;

            // Spawn rate also increases with score
            if (Math.random() < this.spawnRate * (1 + this.gameScore / 500)) {
                this.spawnNPC();
            }

            for (let i = this.activeNPCs.length - 1; i >= 0; i--) {
                const npc = this.activeNPCs[i];
                npc.x += npc.speed * this.difficulty;

                if (npc.x > this.stageWidth) {
                    if (npc.type === 'baddie') this.loseLife();
                    this.activeNPCs.splice(i, 1);
                }
            }
        },

        triggerLevelUp(lvl) {
            this.currentLevel = lvl;
            this.showLevelUp = true;
            this.playEffect('levelup');
            setTimeout(() => { this.showLevelUp = false; }, 1500);
        },

        spawnNPC() {
            const roll = Math.random();
            let selected;
            
            if (roll < 0.05) {
                selected = { icon: '🌟', color: '#ffd700', type: 'powerup' };
            } else if (roll < 0.55) {
                selected = { icon: '💤', color: '#ff4d4d', type: 'baddie' };
            } else {
                selected = { icon: '☕', color: '#4dff88', type: 'guest' };
            }

            this.activeNPCs.push({
                id: this.npcIdCounter++,
                x: -60,
                y: Math.random() * (550 - 50) + 50, 
                speed: Math.random() * 2 + 2,
                ...selected
            });
        },

        bonk(npc) {
            if (!this.gameActive || this.isPaused) return;

            if (npc.type === 'baddie') {
                this.gameScore += 10;
                this.playEffect('hit');
            } else if (npc.type === 'powerup') {
                this.gameScore += 50;
                this.activeNPCs = this.activeNPCs.filter(n => n.type !== 'baddie');
                this.playEffect('powerup');
            } else {
                this.gameScore = Math.max(0, this.gameScore - 20);
                this.loseLife();
                this.playEffect('error');
            }
            this.activeNPCs = this.activeNPCs.filter(n => n.id !== npc.id);
        },

        loseLife() {
            this.gameLives--;
            if (this.gameLives <= 0) this.endGame();
        },

        endGame() {
            this.gameActive = false;
            clearInterval(this.gameLoopInterval);
            const best = localStorage.getItem('tavern_high_score') || 0;
            if (this.gameScore > best) {
                localStorage.setItem('tavern_high_score', this.gameScore);
                alert(`🎉 NEW HIGH SCORE: ${this.gameScore}!`);
            } else {
                alert(`SHIFT OVER!\nScore: ${this.gameScore}\nBest: ${best}`);
            }
        },

        playEffect(type) { console.log(`Tavern Sfx: ${type}`); }
    };

    const finalConfig = {
        ...window.rootConfig,
        data() { return { ...window.rootConfig.data(), ...gameData }; },
        methods: { ...window.rootConfig.methods, ...gameMethods },
        mounted: window.rootConfig.mounted,
        computed: window.rootConfig.computed
    };

    createApp(finalConfig).mount('#app');
});