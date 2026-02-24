# ⚔️ The Last Commit
# Gwen's RPG Portfolio: The Guild Ledger & Great Archive

A high-fidelity, pixel-art inspired web portfolio designed as an interactive RPG experience. Travelers can choose their class, explore a professional "Story Mode," or test their reflexes in an "Arcade Mode".

---

## 🕹️ Game Features

### 📜 Story Mode (The Great Archive)
* **Dynamic XP System:** Travelers gain experience points (XP) and level up by exploring different professional sections like the Skill Tree and Memory Archive.
* **Persistent Progress:** Exploration data is saved to `localStorage`, allowing users to resume their journey at their current Level.
* **Hidden HUD:** An immersive, sliding navigation bar that reveals itself only when the user's cursor approaches the top of the screen to prevent layout clipping.
* **Level Tracking:** A dynamic level counter (LVL) that increments based on the unique areas the traveler has visited.

### ⚔️ Arcade Mode (The Tavern)
* **Mode Selection:** A dedicated branching path screen allows users to choose between the narrative portfolio or the mini-game.
* **Bouncer Mini-game:** A fast-paced reflex challenge where the user acts as the tavern's legendary protector.
* **Persistent Hero:** The character selected at the start menu (Warrior, Mage, Rogue, or Scholar) follows the user into the game.

### 🖋️ Guild Ledger (Guestbook)
* **Real-time Sign-ins:** A live guestbook powered by Supabase that allows visitors to leave messages and choose their RPG class icon.
* **Class-Based UI:** Recent visitor entries feature color-coded borders based on the class the user selected (e.g., Red for Warriors, Blue for Mages).
* **Pixel-Perfect Frame:** Features custom CSS pixel borders and a terminal-style layout designed to avoid layout clipping.

---

## 🛠️ Tech Stack

| Technology | Usage |
| :--- | :--- |
| **Vue.js 3** | Core engine for global state, XP calculations, and reactive UI transitions. |
| **Supabase** | Backend infrastructure for the Guild Ledger, featuring real-time PostgreSQL listeners. |
| **Bootstrap 5** | Responsive grid system used for layout stabilization across different screen sizes. |
| **DiceBear API** | Dynamic generation of pixel-art avatars based on user class selection. |
| **CSS3** | Custom animations for the sliding HUD, pixelated borders, and bouncer game mechanics. |

---

## 📂 Project Structure

* `index.html`: Title Screen and Character Selection.
* `modes.html`: The path selection screen (Story vs. Arcade).
* `profile.html`: Main Hero Stats page featuring the XP-tracking HUD.
* `guild.html`: The Guild Ledger guestbook and recent visitor list.
* `js/main.js`: The "Core Game Logic" handling XP tracking, Supabase integration, and character persistence.
* `css/style.css`: Custom RPG UI styling, including the hidden navigation and pixel borders.
