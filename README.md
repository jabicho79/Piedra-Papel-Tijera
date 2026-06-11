# Piedra, Papel o Tijera — Duelo Multijugador

A premium, interactive Rock-Paper-Scissors game with P2P multiplayer support using WebRTC technology.

## Purpose

**Piedra, Papel o Tijera** is a full-featured web application that brings the classic Rock-Paper-Scissors game to the digital age. The app supports both **local single-player mode** (against the computer) and **online P2P multiplayer mode** where players can challenge each other in real-time without requiring a central server.

The game features:
- **Interactive Gameplay**: Smooth, responsive user interface with instant feedback
- **P2P Multiplayer**: Real-time synchronization between players using WebRTC
- **Sound Effects**: Dynamic audio feedback using Web Audio API synthesis
- **Visual Effects**: Particle explosions and confetti animations for winning moments
- **Fully Containerized**: Docker support for easy deployment and scaling
- **Cloud Ready**: Pre-configured for Azure App Service deployment

## Architecture & Components

### Frontend Components

#### 1. **HTML Structure** (`index.html`)
- Semantic HTML5 layout with Spanish localization
- SVG icon library for game choices (Rock, Paper, Scissors, Copy)
- Canvas element for particle effects and animations
- Header with controls and game status display
- Game board with player sections and score tracking

#### 2. **Styling** (`style.css`)
- Modern, responsive CSS with flexbox and grid layouts
- Animated UI elements with smooth transitions
- Mobile-first design approach
- Color-coded game states (win/loss/draw)
- Visual feedback for player interactions

#### 3. **Core Application Logic** (`app.js`)
The main JavaScript module containing:

- **SoundFX Manager**: Web Audio API synthesizer for dynamic sound effects
- **GameBoard**: Manages game state, scoring, and win/loss logic
- **P2P Network Layer**: PeerJS integration for WebRTC peer-to-peer communication
- **UI Controller**: Handles user interactions and DOM updates
- **Animation System**: Particle effects and visual feedback on game events

### Backend & Deployment

#### 4. **Dockerfile**
- Lightweight nginx:alpine base image
- Serves static assets (HTML, CSS, JS)
- Exposes port 80 for HTTP traffic
- Multi-platform support (linux/amd64, linux/arm64)

#### 5. **Docker Compose** (`docker-compose.yml`)
- Local development environment setup
- Simplified container orchestration

### Configuration Files

- **`.dockerignore`**: Excludes unnecessary files from Docker build context
- **`.claude/settings.local.json`**: Claude Code IDE settings

## Component Interaction Flow

```
User Interaction (Click/Tap)
    ↓
UI Controller captures event
    ↓
Determines Game Mode:
├─ Single Player → Computer AI determines move
└─ Multiplayer → P2P Network sends move to opponent
    ↓
GameBoard evaluates winner
    ↓
SoundFX plays audio feedback
    ↓
Animation System renders visual effects
    ↓
UI updates with result and score
```

### Data Flow in Multiplayer

1. **Local Player Action**: User selects Rock, Paper, or Scissors
2. **P2P Transmission**: Move sent to opponent via WebRTC (PeerJS)
3. **Remote Reception**: Opponent's device receives move
4. **Simultaneous Evaluation**: Both clients evaluate the result independently
5. **State Sync**: Both clients display identical game state
6. **Feedback**: Sound and visual effects trigger on both devices

## Running Locally

### Prerequisites
- Node.js/npm (optional, only if not using Docker)
- Docker & Docker Compose (for containerized setup)
- Modern web browser with WebRTC support

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/jabicho79/Piedra-Papel-Tijera.git
cd Piedra-Papel-Tijera

# Start the container
docker-compose up

# Open in browser
# http://localhost:80
```

### Option 2: Direct File Access

```bash
# Clone the repository
git clone https://github.com/jabicho79/Piedra-Papel-Tijera.git
cd Piedra-Papel-Tijera

# Serve files using Python (Python 3)
python3 -m http.server 8000

# Or using Node.js (if installed)
npx http-server

# Open in browser
# http://localhost:8000 (Python) or http://localhost:8080 (Node.js)
```

### Option 3: Build and Run Docker Image

```bash
# Build the image
docker build -t piedra-papel-tijera .

# Run the container
docker run -d -p 8080:80 piedra-papel-tijera

# Open in browser
# http://localhost:8080
```

## Usage

### Single Player Mode
1. Open the application in your browser
2. Choose your move: Rock, Paper, or Scissors
3. The computer makes a random choice
4. Results are displayed instantly with visual and audio feedback

### Multiplayer Mode (P2P)
1. Player 1 opens the app and creates a game session
2. Share the **Connection ID** with Player 2
3. Player 2 enters the Connection ID to join the game
4. Both players see the same game board
5. Make simultaneous moves and watch the result sync in real-time

## Deployment

### Azure App Service
The application is pre-configured for Azure deployment:

```bash
# Already deployed at:
# https://piedras-dec6h7ggbufbe9an.spaincentral-01.azurewebsites.net
```

The Docker image is hosted on Docker Hub:
```bash
docker pull jabicho/piedra-papel-tijera:latest
docker run -p 80:80 jabicho/piedra-papel-tijera:latest
```

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic markup and structure |
| CSS3 | Styling and animations |
| JavaScript (Vanilla) | Core game logic and interactivity |
| PeerJS | WebRTC P2P communication |
| Web Audio API | Dynamic sound synthesis |
| Canvas API | Particle effects and animations |
| Docker | Containerization and deployment |
| Nginx | HTTP server for static content |
| Azure App Service | Cloud hosting |

## Features

- **Premium UI**: Modern, responsive design with smooth animations
- **Dynamic Audio**: Custom sound effects using Web Audio API synthesis
- **Visual Effects**: Particle explosions and confetti on victories
- **P2P Multiplayer**: Real-time gaming without a central server
- **Cross-Browser**: Works on all modern browsers with WebRTC support
- **Mobile Friendly**: Responsive design for phones and tablets
- **Fast Performance**: Optimized for instant feedback and low latency
- **Containerized**: Easy deployment with Docker

## License

This project is open source and available under the MIT License.

## Author

Created by Javier Mosquera (jabicho)

## Contributing

Feel free to fork this repository and submit pull requests for any improvements!

---

**Enjoy playing Piedra, Papel o Tijera!**
