// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof supabaseClient === 'undefined') {
        console.error("Supabase client not found. Ensure config.js is loaded correctly.");
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

                // --- GUESTBOOK DATA ---
                newName: '',
                newMessage: '',
                submitted: false,
                entries: [],
                // Requirement: Using the REST API endpoint for Supabase
                // Note: Replace 'visitors' with your actual table name if different
                apiUrl: `${supabaseUrl}/rest/v1/visitors`,

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
            currentPageName() {
                const map = {
                    'index.html': 'MAIN TAVERN',
                    'profile.html': 'HERO STATS',
                    'quests.html': 'ADVENTURE LOG',
                    'guild.html': 'GUILD HALL',
                    'bouncer.html': 'TAVERN PATROL'
                };
                return map[this.currentPage] || 'UNKNOWN REALM';
            }
        },

        async mounted() {
            this.checkInitialLock();

            // Only run guestbook logic if on the guild page
            if (this.currentPage === 'guild.html') {
                await this.fetchEntries();
                this.initRealtimeListener();
            }

            this.$nextTick(() => {
                if (this.currentPage === 'profile.html') {
                    this.initSkillHoverEffects();
                }
                this.initScrollToTop();
            });
        },

        methods: {
            // --- GLOBAL NAVIGATION & ENGINE ---
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

            // --- GUESTBOOK METHODS (USING FETCH API) ---
            async fetchEntries() {
                try {
                    const response = await fetch(`${this.apiUrl}?select=*&order=created_at.desc`, {
                        method: 'GET',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`
                        }
                    });
                    if (!response.ok) throw new Error('Network response was not ok');
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
                        headers: { 
                            'Content-Type': 'application/json',
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
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
                        // Refresh the list after successful post
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
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                return new Date(dateString).toLocaleDateString(undefined, options);
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

            // --- UI HELPERS ---
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
    // Pages like bouncer.html extend rootConfig and mount themselves.
    // For guild.html, since we put the fetch logic in main.js, we can mount it here 
    // UNLESS you have a separate guild.js file. 
    // Given the current setup, we will allow it to mount here if no specialized script is present.
    
    const specializedPages = ['bouncer.html']; 
    const isSpecialized = specializedPages.some(page => window.location.pathname.includes(page));

    if (!isSpecialized) {
        Vue.createApp(window.rootConfig).mount('#app');
    }
});