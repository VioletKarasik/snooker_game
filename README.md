# Snooker Game - CM2030 Graphics Programming Project

![Snooker Game Screenshot](screenshot.png) *Example screenshot of the game*

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
| File | Purpose |
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
   function setupBalls(mode) {
     // Mode-specific initialization
   }