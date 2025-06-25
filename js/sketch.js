let canvas;
let score = 0;
let tableTopOffset = 120;

function setup() {
  canvas = createCanvas(1200, 700);
  canvas.parent(document.body);

  rectMode(CORNER);
  ellipseMode(CENTER);

  setupPhysics();

  setupTable(width, height - tableTopOffset);
  tableY += tableTopOffset;

  setupBalls(tableX, tableY, tableWidth, tableHeight);
  setupTableBorders(tableX, tableY, tableWidth, tableHeight);

  const startBtn = document.getElementById("startBtn");
  startBtn.addEventListener("click", () => {
    // Заменим welcome на счётчик
    const welcomeDiv = document.getElementById("welcome");
    welcomeDiv.innerHTML = `<h2>Очки: <span id="scoreDisplay">0</span></h2>`;

    // Убираем отступ и пересоздаём всё
    tableTopOffset = 0;

    // Обновляем стол
    setupTable(width, height - tableTopOffset);
    tableY += tableTopOffset;

    // Пересоздаём шары и бортики
    balls = [];
    setupBalls(tableX, tableY, tableWidth, tableHeight);
    setupTableBorders(tableX, tableY, tableWidth, tableHeight);
  });
}

function draw() {
  Engine.update(engine);

  drawTable();
  drawBalls();
  drawCue();

  // Проверка шаров в лузах
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
