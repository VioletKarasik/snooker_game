let canvas;
let score = 0;
let tableTopOffset = 120;

function setup() {
  canvas = createCanvas(1200, 700);
  canvas.parent(document.body);

  rectMode(CORNER);
  ellipseMode(CENTER);

  setupPhysics();
  setupGame();
}

function setupGame() {
  setupTable(width, height - tableTopOffset);
  setupBalls(tableX, tableY, tableWidth, tableHeight);
  setupTableBorders(tableX, tableY, tableWidth, tableHeight);
}

function draw() {
  Engine.update(engine);
  clear();

  drawTable();
  drawBalls();
  drawCue();
  checkCueBallPotted(); 
  checkColoredBallsPotted();

  for (let i = balls.length - 1; i >= 0; i--) {
    if (checkBallInPocket(balls[i])) {
      Matter.World.remove(engine.world, balls[i].body);
      balls.splice(i, 1);
      score += 10;
      updateScoreDisplay();
    }
  }
}

function updateScoreDisplay() {
  const scoreEl = document.getElementById("scoreDisplay");
  if (scoreEl) scoreEl.textContent = score;
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
}

