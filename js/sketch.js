// sketch.js

function setup() {
  createCanvas(1200, 600);
  rectMode(CORNER);

  setupPhysics();

  // Инициализируем параметры стола в table.js
  setupTable(width, height);

  setupBoundaries(tableX, tableY, tableWidth, tableHeight);
  setupBalls(tableX, tableY, tableWidth, tableHeight);
}

function draw() {
  background(30, 90, 30);

  // Рисуем стол из table.js
  drawTable();

  drawBalls();
}
