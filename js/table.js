let table;
let pockets = [];

function setupTable() {
  table = {
    x: canvasWidth / 2 - tableLength / 2,
    y: canvasHeight / 2 - tableWidth / 2,
    w: tableLength,
    h: tableWidth
  };

  createPockets();
  createCushions(); // создадим позже
}

// Функция для отрисовки стола
function drawTable() {
  // Стол
  push();
  fill(34, 139, 34); // зелёный
  noStroke();
  rect(table.x, table.y, table.w, table.h, 20);
  pop();

  // D-зона
  drawDZone();

  // Лузы
  drawPockets();
}

function createPockets() {
  pockets = [];

  let { x, y, w, h } = table;

  // 6 луз: по углам и в центре длинных сторон
  pockets.push({ x: x, y: y });                         // top-left
  pockets.push({ x: x + w / 2, y: y });                 // top-center
  pockets.push({ x: x + w, y: y });                     // top-right
  pockets.push({ x: x, y: y + h });                     // bottom-left
  pockets.push({ x: x + w / 2, y: y + h });             // bottom-center
  pockets.push({ x: x + w, y: y + h });                 // bottom-right
}

function drawPockets() {
  push();
  fill(0); // чёрные лузы
  noStroke();
  for (let p of pockets) {
    ellipse(p.x, p.y, pocketDiameter);
  }
  pop();
}

function drawDZone() {
  const { x, y, h } = table;
  const dRadius = tableWidth / 6;

  // D-полукруг
  push();
  stroke(255);
  noFill();
  strokeWeight(1.5);
  arc(x + dRadius, y + h / 2, dRadius * 2, dRadius * 2, -HALF_PI, HALF_PI);
  // Линия от нижнего до верхнего края D
  line(x + dRadius, y, x + dRadius, y + h);
  pop();
}
