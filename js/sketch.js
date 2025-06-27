let canvas;
let currentTurnScore = 0; // Очки текущего подхода
let resetButton;
let isTwoPlayerMode = false;
let currentPlayer = 1;
let playerScores = [0, 0]; // Общие очки игроков
let timers = [30, 30];
let timerInterval = null;

function setup() {
  canvas = createCanvas(1200, 850);
  canvas.parent(document.body);

  rectMode(CORNER);
  ellipseMode(CENTER);

  setupPhysics();
  setupGame();
}

function setupGame() {
  setupTable(width, height);
  setupBalls(tableX, tableY, tableWidth, tableHeight);
  setupTableBorders(tableX, tableY, tableWidth, tableHeight);
  setupCollisionDetection();
}

function draw() {
  Engine.update(engine);
  clear();

  drawTable();
  drawBalls();
  drawCue();
  checkCueBallPotted(); 
  checkColoredBallsPotted();

  // Удаление шаров в лузы и подсчёт очков
  for (let i = balls.length - 1; i >= 0; i--) {
    if (checkBallInPocket(balls[i])) {
      const points = getPointsForColor(balls[i].color);
      Matter.World.remove(engine.world, balls[i].body);
      balls.splice(i, 1);
      
      // Добавляем очки текущему игроку
      addScoreForCurrentPlayer(points);
    }
  }
}
function addScoreForCurrentPlayer(points) {
  currentTurnScore += points;
  updateScoreDisplay();
  
  if (isTwoPlayerMode) {
    // Обновляем отображение текущих очков игрока
    document.getElementById(`current${currentPlayer}`).textContent = currentTurnScore;
  }
}
function updateScoreDisplay() {
  const scoreValueEl = document.getElementById("score-value");
  if (scoreValueEl) {
    scoreValueEl.textContent = currentTurnScore;
  }
}

function keyPressed() {
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
  // R — сброс прицеливания
  if (key === 'r' || key === 'R') {
    isAiming = false;
    cueStartPos = null;
    return;
  }

  // K — переключить режим управления
  if (key === 'k' || key === 'K') {
    showAimGuide = !showAimGuide;
    return;
  }

  // Управление в режиме клавиатуры
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
  // Fade out animation
  document.getElementById('resetGameBtn').style.opacity = '0.5';
  setTimeout(() => {
    document.getElementById('resetGameBtn').style.opacity = '1';
  }, 300);

  // Clear the world
  Matter.Composite.clear(engine.world, false);
  
  // Reset game state
  balls = [];
  currentTurnScore = 0;
  cueBall = null;
  cueBallPlaced = false;
  isAiming = false;
  cueStartPos = null;
  strikeAnimationInProgress = false;
  
  // Recreate the game elements
  setupTable(width, height);
  setupBalls(tableX, tableY, tableWidth, tableHeight);
  setupTableBorders(tableX, tableY, tableWidth, tableHeight);
  setupCollisionDetection();
  
  // Update score display
  updateScoreDisplay();
  
  console.log("Game has been reset");
}
function startTwoPlayerGame() {
  isTwoPlayerMode = true;
  playerScores = [0, 0];
  currentTurnScore = 0;
  timers = [30, 30];
  currentPlayer = 1;

  // Обновляем UI
  document.getElementById('score1').textContent = '0';
  document.getElementById('score2').textContent = '0';
  document.getElementById('timer1').textContent = '30';
  document.getElementById('timer2').textContent = '30';
  updateScoreDisplay();
  
  document.getElementById('scoreboard').style.display = 'flex';
  updateActivePlayerUI();
  startTimer();
}

function updateActivePlayerUI() {
  document.getElementById('player1').classList.toggle('active', currentPlayer === 1);
  document.getElementById('player2').classList.toggle('active', currentPlayer === 2);
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timers[currentPlayer - 1]--;
    document.getElementById(`timer${currentPlayer}`).textContent = timers[currentPlayer - 1];
    
    if (timers[currentPlayer - 1] <= 0) {
      // Таймер истёк — штраф и смена игрока
      switchPlayer();
    }
  }, 1000);
}

function switchPlayer() {
  // Добавляем текущие очки к общему счёту игрока
  playerScores[currentPlayer - 1] += currentTurnScore;
   document.getElementById(`current${currentPlayer}`).textContent = currentTurnScore;
  
  // Сбрасываем текущие очки
  currentTurnScore = 0;
  updateScoreDisplay();
  
  // Обновляем таймер
  clearInterval(timerInterval);
  timers[currentPlayer - 1] = 30;
  document.getElementById(`timer${currentPlayer}`).textContent = '30';

  // Меняем игрока
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateActivePlayerUI();
  startTimer();
}

function resetCurrentPlayerTimer() {
  if (isTwoPlayerMode) {
    timers[currentPlayer - 1] = 30;
    document.getElementById(`timer${currentPlayer}`).textContent = '30';
  }
}