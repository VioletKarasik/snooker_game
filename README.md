# Snooker Game - CM2030 Graphics Programming Project

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technical Implementation](#technical-implementation)
- [How to Play](#how-to-play)
- [Requirements Checklist](#requirements-checklist)
- [Extensions](#extensions)
- [Setup](#setup)
- [Credits](#credits)

## Project Overview
A complete snooker simulation built with:
- **p5.js** for rendering
- **Matter.js** for physics
- Modern web technologies

Implements official snooker rules with realistic physics and innovative gameplay features.

## Features

### Core Gameplay
- Regulation-size snooker table (12ft × 6ft ratio)
- Accurate ball physics (friction, restitution)
- Three game modes:
  - Classic formation (press `1`)
  - Random reds only (press `2`)
  - Random all balls (press `3`)
- Hybrid mouse/keyboard controls

### Physics System
- Realistic ball collisions
- Proper cushion bouncing
- Cue ball dynamics
- Pocket detection

### Visual Elements
- Detailed table with wood textures
- Accurate ball colors and markings
- Dynamic lighting effects
- Animated UI elements

## Technical Implementation

### Code Structure
| Action | Control |
|------|---------|
| `physics.js` | Matter.js engine setup |
| `table.js` | Table rendering/physics |
| `balls.js` | Ball classes/behavior |
| `cue.js` | Cue control system |
| `sketch.js` | Main game logic |

### Key Algorithms
1. **Collision Detection**
   - Custom Matter.js event handlers
   - Cue-specific impact detection

2. **Ball Placement**
   ```javascript
   function setupBalls(tableX, tableY, tableWidth, tableHeight) {
    ballDiameter = tableWidth / 36;
    clearAllBalls();

    const rackX = tableX + tableWidth * 0.75;
    const rackY = tableY + tableHeight / 2 - ((Math.sqrt(3) / 2) * ballDiameter * 2);
    setupRedBalls(rackX, rackY);

    setupColoredBalls(tableX, tableY, tableWidth, tableHeight);
    }
   ```
3. **Game Rules**
   - Score calculation
   - Foul detection
   - Turn management

## How to Play

### Basic Controls
| File | Purpose |
|------|---------|
| `Aim` | 	Mouse movement |
| `Shoot` | TClick-drag release |
| `Reset shot` | `R` key |
| `Toggle guide` | `K` key |
| `Change mode` | `1`/`2`/`3` keys |

### Game Rules
- Pot red balls (1pt) followed by colors
- Colors return to spots unless all reds are potted
- Fouls give opponent advantage

## Requirements Checklist

### Mandatory Features
- [x] Table with proper dimensions/ratio  
- [x] Three ball setup modes  
- [x] Physics for balls/cushions  
- [x] Cue control system  
- [x] Collision detection  
- [x] Ball potting rules  

### Advanced Requirements
- [x] Two-player mode  
- [x] Timed turns  
- [x] Visual effects  
- [x] Audio feedback  

## Extensions

### Innovative Features
**Competitive Two-Player Mode**  
✓ Score tracking  
✓ Turn timer  
✓ Player switching  

**Enhanced Visuals**  
✓ Dynamic lighting  
✓ Wood grain textures  
✓ Particle effects  

**Audio System**  
✓ Realistic sound effects  
✓ Background ambiance  

## Setup
```bash
git clone https://github.com/VioletKarasik/snooker_game.git
```
   - Open index.html in browser
   - No additional dependencies required

## Credits

- **Physics Engine:** [Matter.js](https://brm.io/matter-js/)
- **Graphics Library:** [p5.js](https://p5js.org/)
- **Fonts:** [Google Fonts](https://fonts.google.com/)
- **Sound Effects:** [Source Name or URL]

*Developed as part of the CM2030 Graphics Programming module*