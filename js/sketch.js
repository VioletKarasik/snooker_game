let canvas;

function setup() {
  // Создаём canvas с шириной 1200 и высотой 700
  // (чуть больше по высоте, чтобы было место для меню сверху)
  canvas = createCanvas(1200, 700);
  canvas.parent(document.body); // в body, по центру через CSS

  rectMode(CORNER);
  ellipseMode(CENTER);

  setupPhysics();

  // Вызовем setupTable с размерами, учитывая верхний отступ (например, 100px)
  // чтобы стол не был строго посередине canvas, а чуть ниже.
  const tableTopOffset = 120;
  setupTable(width, height - tableTopOffset);

  // Сдвинем tableY вниз на tableTopOffset, чтобы стол был ниже меню
  tableY += tableTopOffset;

  setupBalls(tableX, tableY, tableWidth, tableHeight);
  setupTableBorders(tableX, tableY, tableWidth, tableHeight);

  // Настроим кнопку старт из index.html
  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', () => {
    // Просто сбросим шарики и перезапустим физику или что-то ещё
    // Пока просто уберём кнопку и приветствие
    document.getElementById('welcome').style.display = 'none';
  });
}

function draw() {

  Engine.update(engine);

  drawTable();
  drawBalls();
  drawCue();

  // Удаление шаров, попавших в лузы
  for (let i = balls.length - 1; i >= 0; i--) {
    if (checkBallInPocket(balls[i])) {
      Matter.World.remove(engine.world, balls[i].body);
      balls.splice(i, 1);
    }
  }
}

