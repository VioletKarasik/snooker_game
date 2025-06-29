/**
 * This project implements a complete snooker simulation using p5.js for graphics and Matter.js for physics.
My game recreates professional snooker with realistic physics and rules. As an extension, I added a two-player mode with turn-taking and scoring, making the game truly competitive. I also introduced a unique 
portal system in hard mode — after three missed shots, glowing portals appear and teleport balls across the table. This mechanic adds a creative twist and challenges players to adapt their strategies.

Key technical achievements include:
   - Three distinct ball setup modes (classic formation - 1 key, random reds only - 2 key, random all balls - 3 key)
   - Hybrid mouse/keyboard control: cue aiming (key R for reset) and shot power are controlled using mouse drag and keyboard
   - Advanced physics simulation includes elastic ball-to-ball collisions, cushion bouncing with energy damping, and accurate pocket detection for potting
   - Rule enforcement handles potting rules, fouls (e.g., cue ball), scoring logic, and player turns
   - Dynamic two-player mode alternates turns, tracks scores and fouls, optional timers, and personalized win messages
   - Hard Mode with portal mechanics: when activated, the game introduces a challenge mode where portals randomly spawn on the table after 3 consecutive missed shots, teleporting balls between two locations

The implementation features:
   - Visually detailed snooker table: Rendered with realistic textures, soft shadows, and wood grain for immersive presentation
   - Portal effects with particles: Portals include animated visual effects, glowing outlines, spinning spirals, and orbiting particles for high-tech aesthetic
   - Accurate ball rendering: Each ball is individually styled with authentic colors and dynamic shading
   - Interactive line-of-sight preview: A toggleable guideline (key K) helps players visualize shot direction and predict collisions
   - Responsive cue animation: Smooth cue movement reflects charging and striking actions in real time

Audio & Feedback System:
   - Audio feedback: Sounds are played when balls collide, enter pockets, or the cue strikes — enhancing realism
   - Visual feedback: Real-time score updates, player turn indicators, and dynamic animations create a polished game experience
   - Missed shot tracker: Tracks consecutive missed shots and triggers hard mode events like portal spawns for added difficulty

Technical highlights:
   - Modular architecture organized codebase with clear separation between physics engine, rendering, game logic, and user interaction modules
   - Portal system: Custom logic for portal teleportation, with cooldown timers, positional offsets, and velocity adjustments to simulate smooth transitions
   - Particle engine: Lightweight system for rendering particles around portals, including randomized lifespans, fading, and dynamic motion
   - Hard mode toggle: Interactive button to enable or disable hard mode at runtime, with instant visual and gameplay response
   - Robust collision detection covers ball-to-ball and ball-to-wall interactions ("cue-red", "cue-colour", "cue-cushion" in console)

Unique Ideas for Further Development:
   - AI Opponent: Implement a basic AI-controlled player capable of calculating optimal shots based on ball positions, enabling solo gameplay or practice mode with increasing difficulty levels
*/

// Global game variables
let canvas;
let score = 0;
let resetButton;
let isTwoPlayerMode = false;
let currentPlayer = 1;
let scores = [0, 0];
let timers = [30, 30];
let timerInterval = null;
let gameStarted = false;
let ballsPottedThisTurn = 0; // Number of balls potted in the current turn
let wasStrokeMade = false; // Whether a stroke was made
let shouldCheckTurnEnd = false; // Whether to check for turn completion
let previousPlayerScore = 0; // To store the score before the stroke
let isCheckingTurnEnd = false; // Flag to check for turn completion
let lastHitTime = 0;
const MIN_MOVEMENT_TIME = 900; // 3 seconds minimum movement time
let hardModeEnabled = false; // Flag for enabling/disabling portal mechanics

function setup() {
    // Create canvas and set drawing modes
    canvas = createCanvas(1200, 850);
    canvas.parent(document.body);
    rectMode(CORNER);
    ellipseMode(CENTER);

    // Initialize game systems
    setupPhysics();
    setupGame();

    // Audio system check
    console.log('Audio system check:');
    console.log('- loadSound available:', typeof loadSound !== 'undefined');
    console.log('- AudioContext:', typeof AudioContext !== 'undefined' ? 'supported' : 'not supported');
    loadCueSounds();
}

function setupGame() {
    // Set up game elements
    setupTable(width, height);
    setupBalls(tableX, tableY, tableWidth, tableHeight);
    setupTableBorders(tableX, tableY, tableWidth, tableHeight);
    setupCollisionDetection();
}

function draw() {
    // Main game loop
    Engine.update(engine);
    clear();

    // Render game elements
    drawTable();
    if (hardModeEnabled && portalsActive) {
        drawPortals();
    }

    drawBalls();
    drawCue();

    for (let ball of balls) {
        checkPortal(ball.body);
    }
    // Game logic checks
    checkCueBallPotted();
    checkColoredBallsPotted();
    // Checking for end of move
    if (shouldCheckTurnEnd) {
        const currentTime = Date.now();
        const timeSinceHit = currentTime - lastHitTime;

        if (!ballsMoving() && timeSinceHit >= MIN_MOVEMENT_TIME) {
            console.log("All balls stopped for sufficient time. Checking turn end...");

            if (wasStrokeMade && score === previousPlayerScore && isTwoPlayerMode) {
                console.log("No points scored. Switching player...");
                switchPlayer();

                // Miss - call onPlayerShot with false
                onPlayerShot(false);
            } else if (wasStrokeMade && score > previousPlayerScore) {
                // Ball potted - call onPlayerShot with true
                onPlayerShot(true);
            } else if (wasStrokeMade && score === previousPlayerScore && !isTwoPlayerMode) {
                // Single player, miss
                onPlayerShot(false);
            }

            shouldCheckTurnEnd = false;
            wasStrokeMade = false;
            previousPlayerScore = 0;
        }
    }


    // Check for balls in pockets
    for (let i = balls.length - 1; i >= 0; i--) {
        if (checkBallInPocket(balls[i])) {
            Matter.World.remove(engine.world, balls[i].body);
            balls.splice(i, 1);
            addScoreForBall(balls[i].color);
        }
    }
    if (gameOver && winMessageText) {
        push();
        textAlign(CENTER, CENTER);
        textSize(40);
        textFont('Tahoma');
        fill(0, 255, 0);
        stroke(0);
        strokeWeight(3);
        text(winMessageText, width / 2, height / 2);
        pop();
    }
    drawPenalty();
}

function startGame() {
    // Show/hide UI elements when game starts
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("info-panel").style.display = "block";
    document.querySelector('.reset-btn-container').style.display = 'block';
    document.querySelector('.two-player-btn').style.display = 'inline-block';

    // Show controls toggle button
    const toggleBtn = document.getElementById("toggleControls");
    toggleBtn.style.display = "flex";

    gameStarted = true;
    console.log("Game started!");
}

// Toggle controls panel visibility
document.getElementById('toggleControls').addEventListener('click', function() {
    const controlsPanel = document.getElementById('controls-panel');
    if (controlsPanel) {
        controlsPanel.classList.toggle('visible');
        this.textContent = controlsPanel.classList.contains('visible') ? '✕' : '⚜';
    }
});

function updateScoreDisplay() {
    // Update score display based on game mode
    const scoreValueEl = document.getElementById("score-value");
    if (scoreValueEl) {
        scoreValueEl.textContent = score;
    }
}

function keyPressed() {
    // Debug keys for different ball setups
    if (key === '1') {
        clearAllBalls();
        setupBalls(tableX, tableY, tableWidth, tableHeight);
        cueBall = null;
        cueBallPlaced = false;
    } else if (key === '2') {
        clearAllBalls();
        setupRandomRedBallsOnly();
        cueBall = null;
        cueBallPlaced = false;
    } else if (key === '3') {
        clearAllBalls();
        setupRandomAllBalls();
        cueBall = null;
        cueBallPlaced = false;
    }

    // Reset aiming
    if (key === 'r' || key === 'R') {
        isAiming = false;
        cueStartPos = null;
        return;
    }

    // Toggle aim guide visibility
    if (key === 'k' || key === 'K') {
        showAimGuide = !showAimGuide;
        return;
    }

    // Keyboard controls for aiming
    if (useKeyboardAim) {
        switch (keyCode) {
            case LEFT_ARROW:
                cueAngle -= 0.05;
                break;
            case RIGHT_ARROW:
                cueAngle += 0.05;
                break;
            case 32: // Space
                hitCueBallFromAngle();
                break;
        }
    }
}

function resetGame() {
    // Reset animation effect
    document.getElementById('resetGameBtn').style.opacity = '0.5';
    setTimeout(() => {
        document.getElementById('resetGameBtn').style.opacity = '1';
    }, 300);

    // Clear physics world
    Matter.Composite.clear(engine.world, false);

    // Reset game state
    balls = [];
    score = 0;
    cueBall = null;
    cueBallPlaced = false;
    isAiming = false;
    cueStartPos = null;
    strikeAnimationInProgress = false;

    // Reinitialize game elements
    setupTable(width, height);
    setupBalls(tableX, tableY, tableWidth, tableHeight);
    setupTableBorders(tableX, tableY, tableWidth, tableHeight);
    setupCollisionDetection();

    spawnPortalsRandomly();
    portalsActive = true;
    missedShots = 0;
    // Update UI
    updateScoreDisplay();
    allRedsCleared = false;
    gameOver = false;
    winMessageText = null;
    console.log("Game has been reset");
}

function toggleHardMode() {
    hardModeEnabled = !hardModeEnabled;
    const btn = document.getElementById('hardModeBtn');
    btn.textContent = hardModeEnabled ? 'Hard Mode ON' : 'Hard Mode OFF';

    if (hardModeEnabled) {
        // Hard mode enabled - immediately activate and create portals
        spawnPortalsRandomly();
        portalsActive = true;
    } else {
        // Hard mode disabled - remove portals
        removePortals();
    }
}

function startTwoPlayerGame() {
    // Initialize two-player mode
    isTwoPlayerMode = true;
    scores = [0, 0];
    timers = [30, 30];
    currentPlayer = 1;
    resetGame();

    // Update UI elements
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';
    document.getElementById('timer1').textContent = '30';
    document.getElementById('timer2').textContent = '30';

    document.getElementById('scoreboard').style.display = 'flex';
    updateActivePlayerUI();
    updateScoreDisplay();
    startTimer();
}

function updateActivePlayerUI() {
    // Highlight active player in UI
    document.getElementById('player1').classList.toggle('active', currentPlayer === 1);
    document.getElementById('player2').classList.toggle('active', currentPlayer === 2);
}

function startTimer() {
    // Start countdown timer for current player
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timers[currentPlayer - 1]--;
        document.getElementById(`timer${currentPlayer}`).textContent = timers[currentPlayer - 1];

        if (timers[currentPlayer - 1] <= 0) {
            // Time penalty when timer expires
            scores[currentPlayer - 1] = Math.max(0, scores[currentPlayer - 1] - 1);
            document.getElementById(`score${currentPlayer}`).textContent = scores[currentPlayer - 1];
            switchPlayer();
        }
    }, 1000);
}

function switchPlayer() {
    if (ballsMoving()) {
        console.log("Cannot switch player - balls are still moving");
        return;
    }
    console.log(`Switching from player ${currentPlayer} to ${currentPlayer === 1 ? 2 : 1}`);
    scores[currentPlayer - 1] += score;
    document.getElementById(`score${currentPlayer}`).textContent = scores[currentPlayer - 1];

    score = 0;
    document.getElementById(`current1`).textContent = 0;
    document.getElementById(`current2`).textContent = 0;

    clearInterval(timerInterval);
    timers[currentPlayer - 1] = 30;
    document.getElementById(`timer${currentPlayer}`).textContent = '30';

    currentPlayer = currentPlayer === 1 ? 2 : 1;

    wasStrokeMade = false;
    shouldCheckTurnEnd = false;
    previousPlayerScore = 0;

    updateActivePlayerUI();
    startTimer();
}

function resetCurrentPlayerTimer() {
    // Reset timer for current player
    if (isTwoPlayerMode) {
        timers[currentPlayer - 1] = 30;
        document.getElementById(`timer${currentPlayer}`).textContent = '30';
    }
}

function toggleTwoPlayerMode() {
    // Toggle between single and two-player modes
    if (isTwoPlayerMode) {
        // Switch to single player
        isTwoPlayerMode = false;
        score = 0;
        scores = [0, 0];
        currentPlayer = 1;
        document.getElementById(`current1`).textContent = 0;
        document.getElementById(`current2`).textContent = 0;
        document.getElementById('scoreboard').style.display = 'none';
        clearInterval(timerInterval);
        updateScoreDisplay();
        document.getElementById('toggleTwoPlayerBtn').textContent = 'Two Player Mode';
        resetGame();
    } else {
        // Switch to two-player mode
        startTwoPlayerGame();
        document.getElementById('toggleTwoPlayerBtn').textContent = 'Single Player Mode';
    }
}