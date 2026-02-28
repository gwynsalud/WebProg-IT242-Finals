# ⚔️ The Last Commit
### Gwen's RPG Portfolio: The Guild Ledger & Great Archive

A high-fidelity, pixel-art inspired web portfolio designed as an interactive RPG experience. Travelers can choose their class, explore a professional "Story Mode," or test their reflexes in an "Arcade Mode."

---

## 🕹️ Game Features

### 📜 Story Mode (The Great Archive)
* **Dynamic XP System:** Travelers gain experience points (XP) and level up by exploring professional sections like the Skill Tree and Memory Archive.
* **Persistent Progress:** Exploration data is saved to `localStorage`, allowing users to resume their journey at their current Level.
* **Hidden HUD:** An immersive, sliding navigation bar that reveals itself only when the user's cursor approaches the top of the screen to prevent layout clipping.

### 🃏 The Scholar's Deck (Codex)
* **Interactive Resource Deck:** A specialized "Scholar" interface featuring flip-card mechanics for categorized learning resources and assets.
* **Category Filtering:** Real-time filtering system to sort through "The Deck" by learning platforms, AI, and project credits.

### ⚔️ Arcade Mode (The Tavern)
* **Bouncer Mini-game:** A fast-paced reflex challenge where the user acts as the tavern's legendary protector.
* **Persistent Hero:** The character selected at the start menu follows the user throughout the narrative and arcade experiences.

### 🖋️ Guild Ledger (Guestbook)
* **NestJS Backend Engine:** Powered by a robust **Controller-Service** architecture for secure data handling.
* **Real-time Sign-ins:** A live guestbook integrated with **Supabase**, featuring class-based UI styling and color-coded borders.
* **Environment Security:** API keys are protected using server-side environment variables via the `@nestjs/config` module.

---

## 🛠️ Tech Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | **Vue.js 3** | Core engine for global state, XP calculations, and reactive UI transitions. |
| **Backend** | **NestJS** | Framework providing the API gateway and business logic for the Guild Ledger. |
| **Database** | **Supabase** | Backend infrastructure for the Guild Ledger, featuring PostgreSQL storage. |
| **Deployment** | **Vercel** | Monorepo hosting for both frontend static files and serverless backend functions. |
| **Styling** | **Bootstrap 5 & CSS3** | Responsive grid system and custom pixel-art animations for the HUD and card-flip effects. |

---

## 📂 Project Structure

```text
├── backend/                        # NestJS Server
│   ├── src/
│   │   ├── guild/                  # The Guild Ledger Feature
│   │   │   ├── guild.module.ts     # Wiring for the Guild feature
│   │   │   ├── guild.controller.ts # API Endpoints (@Get, @Post)
│   │   │   └── guild.service.ts    # Supabase logic & OnModuleInit
│   │   ├── app.module.ts           # Root module with ConfigModule
│   │   └── main.ts                 # Entry point with /api prefix
│   ├── .env                        # Local API secrets (ignored)
│   ├── nest-cli.json               # NestJS configuration
│   └── package.json                # Backend dependencies
├── frontend/                       # RPG Client Interface
│   ├── assets/                     # gifs, icons, images
│   ├── css/                        # bouncer.css, resources.css, style.css
│   ├── js/                         # bouncer.js, config.js, main.js, resources.js
│   ├── bouncer.html                # Tavern mini-game
│   ├── guild.html                  # Guestbook interface
│   ├── index.html                  # Title & Character Select
│   ├── modes.html                  # Path selection
│   ├── profile.html                # Story Mode & XP HUD
│   ├── quests.html                 # Quest log
│   └── resources.html              # The Scholar's Deck
├── vercel.json                     # Monorepo routing & builds
├── .gitignore                      # Security rules for .env & dist
└── package.json                    # Root manifest