# Overview

This is a multi-game website featuring two Phaser.js games:

1. **Futbol Game**: A soccer game with multiple players, a ball, goals, and physics-based gameplay. Players can control different team members using various keyboard controls to move, rotate, and kick the ball. The game includes automatic goalkeepers and scoring functionality with a visual field display.

2. **Swim Meet Game**: A swimming competition game currently in early development. The basic structure is in place with empty swimmer classes and core game framework, ready for step-by-step implementation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Multi-Game Portal**: Main `index.html` serves as landing page with navigation to individual games
- **Game Engine**: Built with Phaser.js 3.80.1 game framework loaded via CDN
- **Modular Design**: Uses ES6 modules with separate game files (`futbol.js`, `swimmeet.js`) and player classes
- **Physics System**: Arcade physics for collision detection, ball movement, and player interactions
- **Asset Management**: Visual assets stored in `/assets/` directory with game-specific subdirectories

## Game Architecture

### Futbol Game (Complete)
- **Scene Management**: Single main game scene (Futbol class) handling all gameplay
- **Player System**: Multiple player instances with individual controls and behaviors
  - Player 1: Controlled with numpad (1-left rotate, 3-right rotate, 5-forward, 2-back, 0-kick)
  - Player 1 Midfield: Controlled with JIKL+M keys (J-left rotate, L-right rotate, I-forward, K-back, M-kick)
  - Defense Player: Controlled with WASD+Space (A-left, D-right, W-forward, S-back, Space-kick)
  - Player 2 Midfield: Controlled with FHTG+B keys (F-left rotate, H-right rotate, T-forward, G-back, B-kick)
  - Automatic goalkeepers for both teams
- **Field Layout**: 17x12 tile soccer field with goals, out-of-bounds detection, and collision systems

### Swim Meet Game (In Development)
- **Scene Management**: Single main game scene (SwimMeet class) with basic structure
- **Swimmer System**: Basic Swimmer class created with placeholder methods for future implementation
- **Pool Layout**: Basic blue background, ready for pool graphics and lane implementation
- **Current Status**: Core framework established, awaiting step-by-step feature implementation

# External Dependencies

- **Phaser.js 3.80.1**: Game engine loaded from CDN (https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js)
- **Audio Assets**: Sound effects loaded from external CDN for kick sounds
- **Static Assets**: Local PNG files for player sprites, ball, field graphics, goal tiles, and future swimming assets

# Recent Changes (August 7, 2025)

- Added new Player 1 Midfield player using same Player_A01 assets as Player 1
- Positioned between Player 1 and Player 1 goalkeeper on left side of field
- Implemented JIKL+M control scheme: J (left rotate), L (right rotate), I (forward), K (back), M (kick)
- Added Player 2 Midfield player using Player_A02 assets (same as defense player)
- Positioned between Defense Player and Defense Player goalkeeper on right side of field
- Implemented FHTG+B control scheme: F (left rotate), H (right rotate), T (forward), G (back), B (kick)
- Integrated full physics, collision detection, and ball interaction for both midfield players
- Updated all game systems (loading, sounds, physics, updates) to include both new players

# Recent Changes (September 1, 2025)

- Created basic swim meet game structure with `swimmeet.js` and `swimmer.js` files
- Established SwimMeet scene class with placeholder methods for future development
- Created Swimmer class with basic structure similar to futbol Player class
- Set up blue pool-like background and basic game framework
- Prepared modular architecture for step-by-step swim meet game implementation
- Created main portal page (`index.html`) with styled navigation links to both games
- Established clear separation between futbol and swim meet game interfaces