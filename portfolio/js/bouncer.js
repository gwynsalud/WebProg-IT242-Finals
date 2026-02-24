/**
 * bouncer.js
 * Extends the global rootConfig with Tavern Patrol game logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ensure the global config exists
    if (!window.rootConfig) {
        console.error("Global rootConfig not found. Make sure main.js is loaded before bouncer.js.");
        return;
    }

    const { createApp } = Vue;

    // 2. Define the Game-Specific Data
    const gameData = {
        gameActive: false,
        gameScore: 0,
        gameLives: 3,
        difficulty: 1.0,
        activeNPCs: [],
        npcIdCounter: 0,
        gameLoopInterval: null,
        spawnRate: 0.03,
        stageWidth: 600
    };

    // 3. Define the Game-Specific Methods
    const gameMethods = {
        startBouncerGame() {
            this.gameScore = 0;
            this.gameLives = 3;
            this.difficulty = 1.0;
            this.activeNPCs = [];
            this.gameActive = true;

            if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);

            this.gameLoopInterval = setInterval(() => {
                // We check isPaused (from main.js) to pause the game loop!
                if (this.gameActive && !this.isPaused) {
                    this.updateGame();
                }
            }, 30);
        },

        updateGame() {
            this.difficulty += 0.0005;

            if (Math.random() < this.spawnRate * this.difficulty) {
                this.spawnNPC();
            }

            for (let i = this.activeNPCs.length - 1; i >= 0; i--) {
                const npc = this.activeNPCs[i];
                npc.x += npc.speed * this.difficulty;

                if (npc.x > this.stageWidth) {
                    if (npc.type === 'baddie') {
                        this.loseLife();
                    }
                    this.activeNPCs.splice(i, 1);
                }
            }
        },

        spawnNPC() {
            const isBaddie = Math.random() > 0.5;
            const types = {
                // The "Troublemaker" is now someone falling asleep!
                baddie: { icon: '💤', color: '#ff4d4d', type: 'baddie' }, 
                // The "Guest" is a fresh coffee
                guest: { icon: '☕', color: '#4dff88', type: 'guest' }
            };
            const selected = isBaddie ? types.baddie : types.guest;

            this.activeNPCs.push({
                id: this.npcIdCounter++,
                x: -40,
                y: Math.random() * (350 - 50) + 50,
                speed: Math.random() * 2 + 2,
                ...selected
            });
        },

        bonk(npc) {
            if (!this.gameActive || this.isPaused) return;

            if (npc.type === 'baddie') {
                this.gameScore += 10;
                this.playEffect('hit');
            } else {
                this.gameScore = Math.max(0, this.gameScore - 20);
                this.loseLife();
                this.playEffect('error');
            }
            this.activeNPCs = this.activeNPCs.filter(n => n.id !== npc.id);
        },

        loseLife() {
            this.gameLives--;
            if (this.gameLives <= 0) {
                this.endGame();
            }
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

        playEffect(type) {
            console.log(`Game Sfx: ${type}`);
        }
    };

    // 4. Merge the Global Config with the Game Logic
    const finalConfig = {
        ...window.rootConfig,
        data() {
            // Combine data from main.js and this file
            return {
                ...window.rootConfig.data(),
                ...gameData
            };
        },
        methods: {
            // Combine methods from main.js and this file
            ...window.rootConfig.methods,
            ...gameMethods
        },
        // Also inherit mounted/computed from main.js
        mounted: window.rootConfig.mounted,
        computed: window.rootConfig.computed
    };

    // 5. Finally, mount the app
    createApp(finalConfig).mount('#app');
});