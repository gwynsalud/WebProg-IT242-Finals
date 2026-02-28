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
        stageWidth: 1000,
        stageHeight: 500
    };

    const gameMethods = {
        startBouncerGame() {
            // Measure the stage immediately on start to ensure correct boundaries
            const stage = document.getElementById('game-stage');
            if (stage) {
                this.stageWidth = stage.clientWidth;
                this.stageHeight = stage.clientHeight;
            }

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

            this.difficulty = 1 + (this.currentLevel - 1) * 0.25;

            // Spawn rate scaling
            if (Math.random() < this.spawnRate * (1 + this.gameScore / 500)) {
                this.spawnNPC();
            }

            // Move NPCs
            for (let i = this.activeNPCs.length - 1; i >= 0; i--) {
                const npc = this.activeNPCs[i];
                npc.x += npc.speed * this.difficulty;

                // Check if NPC has fully exited the stage width
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
            const npcSize = 60; // Matches CSS width/height
            const roll = Math.random();
            let selected;
            
            if (roll < 0.05) {
                selected = { icon: '🌟', color: '#ffd700', type: 'powerup' };
            } else if (roll < 0.55) {
                selected = { icon: '💤', color: '#ff4d4d', type: 'baddie' };
            } else {
                selected = { icon: '☕', color: '#4dff88', type: 'guest' };
            }

            // Ensure Y coordinate keeps the NPC fully inside the top and bottom borders
            // Range: 0 to (Stage Height - NPC Height)
            const safeY = Math.random() * (this.stageHeight - npcSize);

            this.activeNPCs.push({
                id: this.npcIdCounter++,
                x: -npcSize, // Start just off-screen to the left
                y: safeY,
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
                // Power-up clears all sleepers currently on screen
                this.activeNPCs = this.activeNPCs.filter(n => n.type !== 'baddie');
                this.playEffect('powerup');
            } else {
                // Hitting coffee costs a life and points
                this.gameScore = Math.max(0, this.gameScore - 20);
                this.loseLife();
                this.playEffect('error');
            }
            // Remove the specific NPC that was clicked
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
            }
            // The UI Overlay handles the "Shift Over" screen; we just stop the logic here.
        },

        playEffect(type) { console.log(`Tavern Sfx: ${type}`); }
    };

    const finalConfig = {
        ...window.rootConfig,
        data() { 
            return { 
                ...window.rootConfig.data(), 
                ...gameData 
            }; 
        },
        methods: { 
            ...window.rootConfig.methods, 
            ...gameMethods 
        },
        mounted() {
            if (window.rootConfig.mounted) window.rootConfig.mounted.call(this);
            
            // Initial boundary check
            const stage = document.getElementById('game-stage');
            if (stage) {
                this.stageWidth = stage.clientWidth;
                this.stageHeight = stage.clientHeight;
            }
            
            // Re-check boundaries if window is resized
            window.addEventListener('resize', () => {
                if (stage) {
                    this.stageWidth = stage.clientWidth;
                    this.stageHeight = stage.clientHeight;
                }
            });
        },
        computed: window.rootConfig.computed
    };

    createApp(finalConfig).mount('#app');
});