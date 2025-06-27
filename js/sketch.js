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
  drawBalls();
  drawCue();
  
  // Game logic checks
  checkCueBallPotted();
  checkColoredBallsPotted();

  // Check for balls in pockets
  for (let i = balls.length - 1; i >= 0; i--) {
    if (checkBallInPocket(balls[i])) {
      Matter.World.remove(engine.world, balls[i].body);
      balls.splice(i, 1);
      addScoreForBall(balls[i].color);
    }
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
  
  // Update UI
  updateScoreDisplay();
  allRedsCleared = false;
  gameOver = false;
  console.log("Game has been reset");
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
  // Handle player switch logic
  scores[currentPlayer - 1] += score;
  document.getElementById(`score${currentPlayer}`).textContent = scores[currentPlayer - 1];
  
  // Reset current break score
  score = 0;
  document.getElementById(`current1`).textContent = 0;
  document.getElementById(`current2`).textContent = 0;
  document.getElementById(`current${currentPlayer}`).textContent = score;
  
  // Reset timer for previous player
  clearInterval(timerInterval);
  timers[currentPlayer - 1] = 30;
  document.getElementById(`timer${currentPlayer}`).textContent = '30';

  // Switch to other player
  currentPlayer = currentPlayer === 1 ? 2 : 1;
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