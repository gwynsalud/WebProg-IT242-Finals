// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if Supabase client is loaded (needed for Real-time Guestbook updates)
    if (typeof supabaseClient === 'undefined') {
        console.error("Supabase client not found. Ensure config.js is loaded correctly.");
        return;
    }

    const { createApp } = Vue;

    const app = createApp({
        data() {
            return {
                // --- GLOBAL STATE ---
                gameStarted: localStorage.getItem('site_unlocked') === 'true',
                isPaused: false,
                userClass: localStorage.getItem('hero_class') || 'Scholar',
                currentPage: window.location.pathname.split("/").pop() || 'index.html',

                // --- GUESTBOOK DATA (Guild Ledger) ---
                newName: '',
                newMessage: '',
                submitted: false,
                entries: [],
                apiUrl: '/api/visitors',

                // --- QUIZ DATA (Scholar's Trial) ---
                isScholar: localStorage.getItem('scholar_trial_passed') === 'true',
                currentStep: 0,
                userAnswer: '',
                questions: [
                    { text: "I have no voice, but I tell the world how to look. I wear many sheets, but I never sleep. What am I?", answer: "CSS" },
                    { text: "I am a view that sees all, reactive and swift. I bind the data to the soul of the page. What am I?", answer: "Vue" },
                    { text: "I am the vault of ten thousand names, the memory of the tavern that never fades. What am I?", answer: "Supabase" }
                ],

                // --- CLASS SELECTION DATA ---
                selectedClass: localStorage.getItem('hero_class') || 'Scholar',
                selectedAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Scholar',
                classes: [
                    { name: 'Warrior', icon: '⚔️', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Warrior' },
                    { name: 'Mage', icon: '🪄', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Mage' },
                    { name: 'Rogue', icon: '🗡️', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rogue' },
                    { name: 'Scholar', icon: '📜', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Scholar' }
                ]
            }
        },

        computed: {
            // Translates filenames to cool RPG Location Names for the Pause Menu
            currentPageName() {
                const map = {
                    'index.html': 'MAIN TAVERN',
                    'profile.html': 'HERO STATS',
                    'quests.html': 'ADVENTURE LOG',
                    'guild.html': 'GUILD HALL',
                    'library.html': 'FORBIDDEN LIBRARY',
                    'bouncer.html': 'TAVERN FLOOR'
                };
                return map[this.currentPage] || 'UNKNOWN REALM';
            }
        },

        async mounted() {
            // A. INITIALIZATION
            this.checkInitialLock();

            // B. PAGE-SPECIFIC LOGIC
            if (this.currentPage === 'guild.html') {
                await this.fetchEntries();
                this.initRealtimeListener();
            }

            // C. KEYBOARD SHORTCUTS (Pause Menu)
            window.addEventListener('keydown', (e) => {
                const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
                if (!isTyping && (e.key === 'Escape' || e.key.toLowerCase() === 'p')) {
                    this.togglePause();
                }
            });

            // D. UI HELPERS
            this.$nextTick(() => {
                if (this.currentPage === 'profile.html') {
                    this.initSkillHoverEffects();
                }
                this.initScrollToTop();
            });
        },

        methods: {
            // --- GLOBAL ENGINE METHODS ---

            togglePause() {
                // Lobby/Start screen shouldn't have a pause menu
                if (this.currentPage === 'index.html' && !this.gameStarted) return;
                
                this.isPaused = !this.isPaused;
                document.body.style.overflow = this.isPaused ? 'hidden' : '';
            },

            checkInitialLock() {
                if (this.gameStarted) {
                    document.body.classList.remove('scroll-locked');
                } else if (this.currentPage === 'index.html') {
                    document.body.classList.add('scroll-locked');
                }
            },

            startGame() {
                this.gameStarted = true;
                localStorage.setItem('site_unlocked', 'true');
                document.body.classList.remove('scroll-locked');
            },

            selectClass(job) {
                this.selectedClass = job.name;
                this.selectedAvatar = job.avatar;
                localStorage.setItem('hero_class', job.name);
                this.userClass = job.name;
            },

            // --- QUIZ METHODS ---

            checkAnswer() {
                const correct = this.questions[this.currentStep].answer.toLowerCase();
                if (this.userAnswer.toLowerCase().trim() === correct) {
                    if (this.currentStep < this.questions.length - 1) {
                        this.currentStep++;
                        this.userAnswer = '';
                    } else {
                        this.isScholar = true;
                        localStorage.setItem('scholar_trial_passed', 'true');
                    }
                } else {
                    // Shake effect logic could go here
                    this.userAnswer = '';
                    alert("The Scholar shakes his head. Try again.");
                }
            },

            // --- DATA METHODS (REST API) ---

            async fetchEntries() {
                try {
                    const response = await fetch(this.apiUrl);
                    this.entries = await response.json();
                } catch (err) {
                    console.error("Ledger fetch failed:", err);
                }
            },

            async addEntry() {
                if (this.submitted || !this.newName.trim() || !this.newMessage.trim()) return;
                this.submitted = true;

                try {
                    const response = await fetch(this.apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: this.newName,
                            message: this.newMessage,
                            desired_class: this.selectedClass,
                            avatar_url: this.selectedAvatar
                        })
                    });

                    if (response.ok) {
                        this.newName = '';
                        this.newMessage = '';
                        setTimeout(() => { this.submitted = false; }, 3000);
                    }
                } catch (err) {
                    this.submitted = false;
                    alert("The ledger is sealed!");
                }
            },

            initRealtimeListener() {
                supabaseClient
                    .channel('public:visitors')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitors' }, 
                    (payload) => {
                        const exists = this.entries.some(e => e.id === payload.new.id);
                        if (!exists) this.entries.unshift(payload.new);
                    })
                    .subscribe();
            },

            // --- UI HELPERS ---

            formatDate(ts) {
                if (!ts) return "Unknown Era";
                return new Date(ts).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                });
            },

            initSkillHoverEffects() {
                const skillItems = document.querySelectorAll('.skill-item');
                const descBox = document.getElementById('skill-desc');
                if (!descBox) return;

                skillItems.forEach(item => {
                    item.addEventListener('mouseenter', () => {
                        descBox.innerText = `SKILL: ${item.dataset.skill} | MASTERY: ${item.dataset.mastery}`;
                    });
                    item.addEventListener('mouseleave', () => {
                        descBox.innerText = "Hover over a skill to see mastery level.";
                    });
                });
            },

            initScrollToTop() {
                const btn = document.getElementById("scroll-to-top");
                if (!btn) return;
                window.addEventListener('scroll', () => {
                    btn.classList.toggle("visible", window.scrollY > 500);
                });
            }
        }
    });

    // IMPORTANT: Every HTML page must have <div id="app">
    app.mount('#app');
});