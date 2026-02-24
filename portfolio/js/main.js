// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // MATCHING CONFIG.JS: Check if the credentials exist
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
        console.error("Configuration missing! Make sure config.js defines SUPABASE_URL and SUPABASE_ANON_KEY.");
        return;
    }

    // --- SHARED APP CONFIGURATION ---
    window.rootConfig = {
        data() {
            return {
                // --- GLOBAL STATE ---
                gameStarted: localStorage.getItem('site_unlocked') === 'true',
                isPaused: false,
                userClass: localStorage.getItem('hero_class') || 'Scholar',
                currentPage: window.location.pathname.split("/").pop() || 'index.html',

                // --- EXPLORATION / XP SYSTEM ---
                // List of all story mode sections to track
                allSections: [
                    'profile.html', 'training.html', 'skills.html', 'objectives.html', 
                    'archive.html', 'quests.html', 'side-quests.html', 'resources.html', 'guild.html'
                ],
                visitedSections: JSON.parse(localStorage.getItem('visited_sections')) || [],

                // --- GUESTBOOK DATA ---
                isLoading: false,
                newName: '',
                newMessage: '',
                submitted: false,
                entries: [],
                apiUrl: `${SUPABASE_URL}/rest/v1/visitors`,

                // --- CLASS SELECTION DATA ---
                selectedClass: localStorage.getItem('hero_class') || 'Scholar',
                selectedAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Scholar',
                classes: [
                    { name: 'Warrior', icon: '⚔️', avatar: 'assets/images/warrior.png' },
                    { name: 'Mage', icon: '🪄', avatar: 'assets/images/mage.png' },
                    { name: 'Rogue', icon: '🗡️', avatar: 'assets/images/rogue.png' },
                    { name: 'Scholar', icon: '📜', avatar: 'assets/images/scholar.png' }
                ]
            }
        },

        computed: {
            currentPageName() {
                const map = {
                    'index.html': 'MAIN TAVERN',
                    'profile.html': 'HERO STATS',
                    'quests.html': 'ADVENTURE LOG',
                    'guild.html': 'GUILD HALL',
                    'bouncer.html': 'TAVERN PATROL',
                    'modes.html': 'PATH SELECTION'
                };
                return map[this.currentPage] || 'UNKNOWN REALM';
            },

            // Calculates the width of the gold XP bar
            explorationProgress() {
                if (this.allSections.length === 0) return 0;
                const progress = (this.visitedSections.length / this.allSections.length) * 100;
                return Math.min(progress, 100);
            },

            // Dynamic Level calculation based on exploration
            currentLevel() {
                // Level up for every 2 unique sections visited
                const lvl = Math.floor(this.visitedSections.length / 2) + 1;
                return lvl.toString().padStart(2, '0');
            }
        },

        async mounted() {
            this.checkInitialLock();
            this.trackExploration(); // Record current page visit

            // Run Guestbook logic only on Guild Hall page
            if (this.currentPage === 'guild.html') {
                await this.fetchEntries();
                if (typeof supabaseClient !== 'undefined') {
                    this.initRealtimeListener();
                }
            }

            this.$nextTick(() => {
                if (this.currentPage === 'profile.html') {
                    this.initSkillHoverEffects();
                }
                this.initScrollToTop();
            });
        },

        methods: {
            // --- XP TRACKING LOGIC ---
            trackExploration() {
                // Check if the current page is one of our tracked story sections
                if (this.allSections.includes(this.currentPage)) {
                    if (!this.visitedSections.includes(this.currentPage)) {
                        this.visitedSections.push(this.currentPage);
                        localStorage.setItem('visited_sections', JSON.stringify(this.visitedSections));
                        
                        // Optional: Console log to verify progress
                        console.log(`Quest Updated: ${this.currentPage} recorded. XP: ${this.explorationProgress}%`);
                    }
                }
            },

            togglePause() {
                this.isPaused = !this.isPaused;
                document.body.style.overflow = this.isPaused ? 'hidden' : '';
            },

            navigateTo(url) {
                this.isPaused = false;
                document.body.style.overflow = '';
                window.location.href = url;
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

            async fetchEntries() {
                this.isLoading = true;
                try {
                    const response = await fetch(`${this.apiUrl}?select=*&order=created_at.desc`, {
                        method: 'GET',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                        }
                    });
                    if (!response.ok) throw new Error('API fetch failed');
                    this.entries = await response.json();
                } catch (err) { 
                    console.error("Ledger fetch failed:", err); 
                } finally {
                    setTimeout(() => { this.isLoading = false; }, 500);
                }
            },

            async addEntry() {
                if (this.submitted || !this.newName.trim() || !this.newMessage.trim()) return;
                
                this.submitted = true;
                try {
                    const response = await fetch(this.apiUrl, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Prefer': 'return=representation' 
                        },
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
                        await this.fetchEntries();
                        setTimeout(() => { this.submitted = false; }, 3000);
                    } else {
                        throw new Error('Post failed');
                    }
                } catch (err) { 
                    this.submitted = false; 
                    alert("The ledger is sealed!"); 
                    console.error(err);
                }
            },

            formatDate(dateString) {
                if (!dateString) return "Ancient Time";
                const date = new Date(dateString);
                const options = { month: 'short', day: 'numeric', year: 'numeric' };
                const datePart = date.toLocaleDateString(undefined, options);
                const timePart = date.toLocaleTimeString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: false 
                });
                return `${datePart} @ ${timePart}`;
            },

            initRealtimeListener() {
                supabaseClient
                    .channel('public:visitors')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitors' }, 
                    (payload) => {
                        const exists = this.entries.some(e => e.id === payload.new.id);
                        if (!exists) this.entries.unshift(payload.new);
                    }).subscribe();
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
    };

    // --- MOUNT LOGIC ---
    const isBouncerPage = window.location.pathname.includes('bouncer.html');
    if (!isBouncerPage) {
        Vue.createApp(window.rootConfig).mount('#app');
    }
});