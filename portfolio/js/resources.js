document.addEventListener('DOMContentLoaded', () => {
    const { createApp } = Vue;

    createApp({
        data() {
            return {
                filter: 'learning',
                currentTime: new Date().toLocaleTimeString(),
                resources: [
                    // LEARNING
                    { name: "MDN WEB DOCS", desc: "The definitive encyclopedia for web developers.", url: "https://developer.mozilla.org", icon: "📖", category: "learning", flipped: false },
                    { name: "CSS TRICKS", desc: "Mastering the art of modern layouts.", url: "https://css-tricks.com", icon: "🎨", category: "learning", flipped: false },
                    { name: "W3SCHOOLS", desc: "The classic training grounds for web sorcery and coding basics.", url: "https://www.w3schools.com", icon: "🏫", category: "learning", flipped: false },
                    { name: "KHAN ACADEMY", desc: "A vast library of universal knowledge for the aspiring polymath.", url: "https://www.khanacademy.org", icon: "🌳", category: "learning", flipped: false },

                    // PLATFORMS
                    { name: "FIREBASE", desc: "Backend engine for our real-time guestbook.", url: "https://firebase.google.com", icon: "🔥", category: "platforms", flipped: false },
                    { name: "GITHUB", desc: "The vault where the source code is kept.", url: "https://github.com", icon: "🐙", category: "platforms", flipped: false },

                    // AI HELP
                    { name: "GEMINI AI", desc: "The AI thought partner for this project.", url: "https://gemini.google.com/share/32cdeabe9177", icon: "✨", category: "ai", flipped: false },
                    { name: "CHATGPT", desc: "Logic debugging and code optimization.", url: "https://chatgpt.com/share/6964b974-5878-8013-a7b6-256d3abf441d", icon: "🤖", category: "ai", flipped: false },

                    // CREDITS
                    { name: "GOOGLE FONTS", desc: "Supplying the 'Press Start 2P' typography.", url: "https://fonts.google.com", icon: "🔤", category: "credits", flipped: false },
                    { name: "ITCH.IO", desc: "Inspiration for pixel art and game UI.", url: "https://itch.io", icon: "🎮", category: "credits", flipped: false },
                    { name: "MEDIEVAL NOBLE", desc: "Medieval lady portrait sprite used for NPC character design.", url: "https://captainskolot.itch.io/ravishing-medieval-lady-portrait-pixel-art-sprite-female-noble-bust-rpg-fantas", icon: "👑", category: "credits", flipped: false },
                    { name: "KIKI'S DELIVERY", desc: "Studio Ghibli inspired pixel art reference for environmental storytelling.", url: "https://www.pinterest.com/pin/735423814162434964/", icon: "🧹", category: "credits", flipped: false },

                    // ASSETS
                    { name: "FLATICON", desc: "Source for various pixelated icons.", url: "https://flaticon.com", icon: "📦", category: "assets", flipped: false },
                    { name: "SNOW STORY GIF", desc: "A serene pixel art animation of falling snow, perfect for atmospheric backgrounds.", url: "https://cdna.artstation.com/p/assets/images/images/031/893/686/original/camille-unknown-snow-story-01.gif?1604917299", icon: "❄️", category: "assets", flipped: false },
                    { name: "PIXEL PROFILE BG", desc: "Lo-fi aesthetic background used for the player profile interface.", url: "https://i.pinimg.com/originals/92/33/80/92338017c079bea4f1250ed4a3056117.gif", icon: "🖼️", category: "assets", flipped: false },
                    { name: "POCHACCO PIXEL", desc: "Sanrio themed pixel art sprite from DinoPixel.", url: "https://dinopixel.com/pochacco-pixel-art-37356", icon: "🐶", category: "assets", flipped: false },
                    { name: "SYLVEON PIXILART", desc: "A cute Pokemon Sylveon sprite created on Pixilart.", url: "https://www.pixilart.com/art/pokemon-cute-sylveon-5d626dbcbf9e", icon: "🎀", category: "assets", flipped: false },
                    { name: "ARTEMIS PIXEL", desc: "Transparent pixel sprite of Artemis/Luna from Sailor Moon.", url: "https://www.kindpng.com/imgv/hbobxxx_sailor-moon-luna-sailor-moon-png-pixel-transparent/", icon: "🌙", category: "assets", flipped: false }
                ]
            }
        },
        computed: {
            filteredResources() {
                return this.resources.filter(r => r.category === this.filter);
            }
        },
        mounted() {
            setInterval(() => {
                this.currentTime = new Date().toLocaleTimeString();
            }, 1000);
        }
    }).mount('#resources-app');
});