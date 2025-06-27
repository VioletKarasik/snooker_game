let canvas;
let score = 0;
let resetButton;
let isTwoPlayerMode = false;
let currentPlayer = 1;
let scores = [0, 0];
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

  // Удаление шаров в лузы и подсчёт очков (если есть не учтённые случаи)
  for (let i = balls.length - 1; i >= 0; i--) {
    if (checkBallInPocket(balls[i])) {
      Matter.World.remove(engine.world, balls[i].body);
      balls.splice(i, 1);
      // Если вдруг сюда попадёт шар — добавим очки (на всякий случай)
      addScoreForBall(balls[i].color);
    }
  }
drawPenalty();
}


function updateScoreDisplay() {
  const scoreValueEl = document.getElementById("score-value");
  if (scoreValueEl) {
    if (!isTwoPlayerMode) {
      // В одиночном режиме просто показываем общий score
      scoreValueEl.textContent = score;
    } else {
      // В двух игроков можно показывать текущие очки текущего игрока здесь тоже (опционально)
      scoreValueEl.textContent = score; 
    }
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
  // Play a subtle sound effect if you have one
  // playSound('reset');
  
  // Fade out animation
  document.getElementById('resetGameBtn').style.opacity = '0.5';
  setTimeout(() => {
    document.getElementById('resetGameBtn').style.opacity = '1';
  }, 300);

  // Clear the world
  Matter.Composite.clear(engine.world, false);
  
  // Reset game state
  balls = [];
  score = 0;
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
  scores = [0, 0];
  timers = [30, 30];
  currentPlayer = 1;
  resetGame();

  document.getElementById('score1').textContent = '0';
  document.getElementById('score2').textContent = '0';
  document.getElementById('timer1').textContent = '30';
  document.getElementById('timer2').textContent = '30';
  
  document.getElementById('scoreboard').style.display = 'flex';
  updateActivePlayerUI();
  updateScoreDisplay(); // обновить отображение очков
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
      // Таймер истёк — штраф
      scores[currentPlayer - 1] = Math.max(0, scores[currentPlayer - 1] - 1);
      document.getElementById(`score${currentPlayer}`).textContent = scores[currentPlayer - 1];
      switchPlayer();
    }
  }, 1000);
}
function switchPlayer() {
  // При смене игрока добавляем текущие очки к общему счёту игрока
  scores[currentPlayer - 1] += score;
  document.getElementById(`score${currentPlayer}`).textContent = scores[currentPlayer - 1];
  
  // Сбрасываем текущие очки (подход)
  score = 0;
  document.getElementById(`current1`).textContent = 0;
document.getElementById(`current2`).textContent = 0;
  // Обновляем отображение текущих очков текущего игрока
  document.getElementById(`current${currentPlayer}`).textContent = score;
  
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
function toggleTwoPlayerMode() {
  if (isTwoPlayerMode) {
    // Выключаем двух игроков — возвращаемся в одиночный режим
    isTwoPlayerMode = false;
    score = 0;
    scores = [0, 0];
    currentPlayer = 1;
document.getElementById(`current1`).textContent = 0;
document.getElementById(`current2`).textContent = 0;
    // Скрываем панель двух игроков (если есть)
    document.getElementById('scoreboard').style.display = 'none';

    // Сбрасываем таймеры, если нужно
    clearInterval(timerInterval);

    // Обновляем отображение очков для одиночного режима
    updateScoreDisplay();

    // Меняем текст кнопки
    document.getElementById('toggleTwoPlayerBtn').textContent = 'Two Player Mode';

    // Любая дополнительная очистка или сброс игры
    resetGame();

  } else {
    // Включаем двух игроков
    startTwoPlayerGame();

    // Меняем текст кнопки
    document.getElementById('toggleTwoPlayerBtn').textContent = 'Single Player Mode';
  }
}
