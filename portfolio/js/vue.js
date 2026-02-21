document.addEventListener('DOMContentLoaded', () => {
  // --- 1. FIREBASE CONFIGURATION ---
  const firebaseConfig = {
    databaseURL: "https://rpg-portfolio-default-rtdb.asia-southeast1.firebasedatabase.app/",
  };
  
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded");
    return;
  }
  
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();

  // --- 2. VUE APPLICATION ---
  const { createApp } = Vue;

  const app = createApp({
    data() {
      return {
        // Game State
        gameStarted: false,
        isPaused: false,
        
        // Guestbook Data
        newName: '',
        newMessage: '',
        submitted: false,
        entries: []
      }
    },
    mounted() {
      // A. INITIALIZATION
      this.checkInitialLock();
      
      // B. FIREBASE LISTENER
      db.ref('guestbook').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          this.entries = Object.keys(data).map(key => data[key]).reverse();
        } else {
          this.entries = [];
        }
      });

      // C. KEYBOARD SHORTCUTS
      window.addEventListener('keydown', (e) => {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isTyping && (e.key === 'Escape' || e.key.toLowerCase() === 'p')) {
          this.togglePause();
        }
      });

      // --- D. MERGED SKILLS & SCROLL LOGIC ---
      // We use $nextTick to ensure Vue has finished drawing the HTML first
      this.$nextTick(() => {
        this.initSkillHoverEffects();
        this.initScrollToTop();
      });
    },
    methods: {
      // --- ORIGINAL METHODS ---
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
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = ''; 
        }
      },
      navigateTo(sectionId) {
        this.isPaused = false;
        document.body.style.overflow = ''; // Ensure scrolling is restored
        
        this.$nextTick(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
      },

      addEntry() {
        if (this.submitted || !this.newName.trim() || !this.newMessage.trim()) return;
        
        const entryData = {
          name: this.newName,
          message: this.newMessage,
          date: new Date().toLocaleDateString()
        };

        db.ref('guestbook').push(entryData).then(() => {
          this.submitted = true;
          this.newName = '';
          this.newMessage = '';
          setTimeout(() => { this.submitted = false; }, 3000);
        });
      },

      // --- NEW METHODS FOR SKILLS & SCROLL ---
      
      initSkillHoverEffects() {
        // This replaces your separate querySelectorAll script
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
        // This replaces your window.onscroll script
        const scrollBtn = document.getElementById("scroll-to-top");
        
        if (scrollBtn) {
          window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
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