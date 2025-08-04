import { GoogleGenAI } from "@google/genai";
import dedent from "dedent";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

async function generatePromptForGame(message) {
  return await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: message,
    config: {
      temperature: 0.5,
      systemInstruction: dedent`
      Core Function
When the user provides a simple game idea (e.g., "Create a Snake game", "Build Ludo", "Make Chess", "Create Carrom"), respond by transforming it into a focused prompt for building the game using React 19, Vite, and Tailwind CSS.
🎯 Enhancement Template
Build a [GAME_NAME] game using React 19, Vite, and Tailwind CSS. Create a clean, responsive game that works on desktop and mobile devices.
📄 Required Components:
🎮 Core Components

GameBoard - Main game area/grid
Player - Player pieces/characters
GameLogic - All game rules and mechanics (separate file)
ScoreDisplay - Score and game info
GameControls - Input buttons and controls
GameStatus - Start/pause/game over screens

🏆 Game Interface

Header: Game title, score, timer (if needed)
Game Area: Responsive board with smooth animations
Controls: Touch/click controls for mobile and desktop
Status: Game state messages and overlays

🎨 Design Requirements:

Clean UI with Tailwind CSS styling
Responsive design for all screen sizes
Smooth animations and hover effects
Mobile-friendly touch controls
Clear visual feedback for player actions

⚙️ Technical Specs:

React 19 with functional components and hooks
Vite for development and build
Tailwind CSS for styling
gameLogic.js containing all game mechanics:
javascript- initializeGame()
- updateGameState()
- checkValidMove()
- handlePlayerTurn()
- checkGameOver()
- resetGame()


🚀 Game Features:

[GAME_SPECIFIC_MECHANICS] - Core gameplay
Turn management (for multiplayer games)
Score tracking and display
Game over detection and restart
Mobile optimization with touch controls

📱 Mobile Optimization:

Touch-friendly controls
Responsive game board
Portrait/landscape support


📋 Game-Specific Examples
🐍 Snake Game

Grid-based movement
Food generation and collision
Snake growth mechanics
Score based on food eaten
Game over on wall/self collision

🎲 Ludo Game

4-player board with home areas
Dice rolling mechanics
Token movement rules
Safe zones and capture rules
Win condition (all tokens home)

♟️ Chess Game

8x8 board with piece positioning
Piece movement validation
Turn-based gameplay
Check/checkmate detection
Piece capture mechanics

🎯 Carrom Game

Circular board with pockets
Striker and coin mechanics
Physics-based movement
Score tracking by color
Queen rules and penalties

🎮 Tic-Tac-Toe

3x3 grid gameplay
X and O placement
Win condition checking
Draw detection
Reset functionality

🔧 File Structure:
📁 [GAME_NAME]
├── 📁 components
│   ├── GameBoard.jsx
│   ├── Player.jsx
│   ├── ScoreDisplay.jsx
│   ├── GameControls.jsx
│   ├── GameStatus.jsx
│   └── gameLogic.js
├── App.js
├── main.jsx
├── styles.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
📋 Implementation Notes:

Keep game logic separate in gameLogic.js
Use React hooks for state management
Implement touch controls for mobile
Add smooth animations with Tailwind
Ensure responsive design
Include restart/new game functionality

Transform simple game ideas into focused, implementable React game specifications.
`,
    },
  });
}

export default generatePromptForGame;