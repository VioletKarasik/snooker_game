// sketch.js

let tableWidth, tableHeight;
let tableX, tableY;
let pocketDiameter;

function setup() {
  createCanvas(1200, 600); // можно менять размер, главное соблюсти пропорции 2:1
  rectMode(CORNER);
  setupPhysics();

  // Размеры стола согласно заданию
  tableWidth = width * 0.9;  // например 90% ширины окна
  tableHeight = tableWidth / 2; // пропорция 2:1

  // Положение стола по центру холста
  tableX = (width - tableWidth) / 2;
  tableY = (height - tableHeight) / 2;

  // Размер лузы (1.5 диаметра шара)
  pocketDiameter = tableWidth / 36 * 1.5;
  setupBalls(tableX, tableY, tableWidth, tableHeight);
}

function draw() {
  background(30, 90, 30); // зелёный фон (похожий на сукно)

  drawTable();
  drawBalls();
}

function drawTable() {
  // Рисуем стол: коричневый бортик и зелёное сукно

  // Бортик (окантовка)
  fill(102, 51, 0); // темно-коричневый
  noStroke();
  rect(tableX - 20, tableY - 20, tableWidth + 40, tableHeight + 40, 20);

  // Сукно (основная игровая поверхность)
  fill(20, 100, 20);
  rect(tableX, tableY, tableWidth, tableHeight, 10);

  // Лузи - в углах и по центру длинных сторон
  fill(0);
  let pockets = getPocketPositions();
  for (let p of pockets) {
    ellipse(p.x, p.y, pocketDiameter);
  }

  // Линии (например, границы "D" зоны и центр)
  stroke(255);
  strokeWeight(2);

  // Линия центра стола (середина по ширине)
  line(tableX, tableY + tableHeight / 2, tableX + tableWidth, tableY + tableHeight / 2);

  // Добавим "D" зону слева (для вставки cue ball)
  let dRadius = tableWidth * 0.15;
  let dCenterX = tableX + dRadius + pocketDiameter * 2;
  let dCenterY = tableY + tableHeight / 2;

  noFill();
  arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, -HALF_PI, HALF_PI);
}
 
function getPocketPositions() {
  return [
    { x: tableX, y: tableY }, // верхний левый угол
    { x: tableX + tableWidth / 2, y: tableY }, // верхняя середина
    { x: tableX + tableWidth, y: tableY }, // верхний правый угол
    { x: tableX, y: tableY + tableHeight }, // нижний левый угол
    { x: tableX + tableWidth / 2, y: tableY + tableHeight }, // нижняя середина
    { x: tableX + tableWidth, y: tableY + tableHeight }, // нижний правый угол
  ];
}
