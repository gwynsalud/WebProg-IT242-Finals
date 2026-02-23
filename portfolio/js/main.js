// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if Supabase client is loaded from config.js
    if (typeof supabaseClient === 'undefined') {
        console.error("Supabase client not found. Ensure config.js is loaded correctly.");
        return;
    }

    const { createApp } = Vue;

    const app = createApp({
        data() {
            return {
                // Game State
                gameStarted: false,
                isPaused: false,

                // Guestbook Form Data
                newName: '',
                newMessage: '',
                submitted: false,
                entries: [],

                // RPG Class Selection Data
                selectedClass: 'Scholar',
                selectedAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Scholar', // Placeholder pixel art
                classes: [
                    { name: 'Warrior', icon: '⚔️', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Warrior' },
                    { name: 'Mage', icon: '🪄', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Mage' },
                    { name: 'Rogue', icon: '🗡️', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rogue' },
                    { name: 'Scholar', icon: '📜', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Scholar' }
                ]
            }
        },

        async mounted() {
            // A. INITIALIZATION
            this.checkInitialLock();

            // B. SUPABASE INITIAL FETCH
            await this.fetchEntries();

            // C. REAL-TIME LISTENER (Replaces Firebase .on('value'))
            // This makes the guestbook update instantly when someone else signs!
            supabaseClient
                .channel('schema-db-changes')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitors' }, payload => {
                    this.entries.unshift(payload.new);
                })
                .subscribe();

            // D. KEYBOARD SHORTCUTS
            window.addEventListener('keydown', (e) => {
                const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
                if (!isTyping && (e.key === 'Escape' || e.key.toLowerCase() === 'p')) {
                    this.togglePause();
                }
            });

            // E. UI HELPERS
            this.$nextTick(() => {
                this.initSkillHoverEffects();
                this.initScrollToTop();
            });
        },

        methods: {
            // --- DATA METHODS ---

            async fetchEntries() {
                const { data, error } = await supabaseClient
                    .from('visitors')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching ledger:", error.message);
                } else {
                    this.entries = data;
                }
            },

            async addEntry() {
                if (this.submitted || !this.newName.trim() || !this.newMessage.trim()) return;

                this.submitted = true;

                const { data, error } = await supabaseClient
                    .from('visitors')
                    .insert([{
                        name: this.newName,
                        message: this.newMessage,
                        desired_class: this.selectedClass,
                        avatar_url: this.selectedAvatar
                    }])
                    .select();

                if (error) {
                    console.error("Error signing ledger:", error.message);
                    this.submitted = false;
                } else {
                    // Note: Real-time listener handles the unshift, 
                    // but we clear the form here
                    this.newName = '';
                    this.newMessage = '';
                    setTimeout(() => { this.submitted = false; }, 3000);
                }
            },

            selectClass(job) {
                this.selectedClass = job.name;
                this.selectedAvatar = job.avatar;
            },

            formatDate(timestamp) {
                if (!timestamp) return "Unknown Date";
                const date = new Date(timestamp);
                return date.toLocaleDateString();
            },

            // --- GAME ENGINE METHODS ---

            checkInitialLock() {
                const unlocked = localStorage.getItem('site_unlocked');
                if (unlocked === 'true') {
                    this.gameStarted = true;
                    document.body.classList.remove('scroll-locked');
                } else {
                    document.body.classList.add('scroll-locked');
                }
            },

            startGame() {
                this.gameStarted = true;
                this.isPaused = false;
                localStorage.setItem('site_unlocked', 'true');
                document.body.classList.remove('scroll-locked');
                this.navigateTo('characters');
            },

            togglePause() {
                if (!this.gameStarted) return;
                this.isPaused = !this.isPaused;
                document.body.style.overflow = this.isPaused ? 'hidden' : '';
            },

            navigateTo(sectionId) {
                this.isPaused = false;
                document.body.style.overflow = '';
                
                this.$nextTick(() => {
                    const el = document.getElementById(sectionId);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                });
            },

            // --- UI INTERACTION METHODS ---

            initSkillHoverEffects() {
                const skillItems = document.querySelectorAll('.skill-item');
                const descBox = document.getElementById('skill-desc');

                if (skillItems.length > 0 && descBox) {
                    skillItems.forEach(item => {
                        item.addEventListener('mouseenter', () => {
                            const skill = item.getAttribute('data-skill');
                            const mastery = item.getAttribute('data-mastery');
                            descBox.innerText = `SKILL: ${skill} | CLASS: ${mastery}`;
                        });
                        item.addEventListener('mouseleave', () => {
                            descBox.innerText = "Hover over a skill to see mastery level.";
                        });
                    });
                }
            },

            initScrollToTop() {
                const scrollBtn = document.getElementById("scroll-to-top");
                if (scrollBtn) {
                    window.addEventListener('scroll', () => {
                        if (document.documentElement.scrollTop > 500) {
                            scrollBtn.classList.add("visible");
                        } else {
                            scrollBtn.classList.remove("visible");
                        }
                    });
                }
            }
        }
    });

    app.mount('#guestbook-app');
});