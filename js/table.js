// table.js

let tableWidth, tableHeight, tableX, tableY, pocketDiameter;

function setupTable(canvasWidth, canvasHeight) {
  tableWidth = canvasWidth * 0.9;
  tableHeight = tableWidth / 2;

  tableX = (canvasWidth - tableWidth) / 2;
  tableY = (canvasHeight - tableHeight) / 2 + 50;

  pocketDiameter = tableWidth / 36 * 1.5;
}
function drawTable() {
  // --- Деревянный борт с лёгкой текстурой + зелёные градиенты ---
  noStroke();
  for (let i = 0; i < 20; i++) {
    let inter = map(i, 0, 19, 0.4, 0.7);
    fill(102 * inter, 51 * inter, 0);
    rect(tableX - 20 - i, tableY - 20 - i, tableWidth + 40 + i * 2, tableHeight + 40 + i * 2, 30);
  }

  // Зелёные градиенты на бортах
  drawGreenBordersGradient();

  // --- Основное поле (заполняем базовым зелёным) ---
  fill(30, 100, 30);
  rect(tableX, tableY, tableWidth, tableHeight);

  // --- Градиент затемнения у краёв игрового поля ---
  drawTableDarkEdgesGradient();

  // --- Контур стола ---
  noFill();
  stroke(0, 50);
  strokeWeight(1);
  rect(tableX, tableY, tableWidth, tableHeight, 12);

  // --- Лузы с тенью ---
  drawPockets();

  // --- Разметка стола (D и линия) ---
  drawTableMarkings();
}

function drawTableDarkEdgesGradient() {
  let ctx = drawingContext;
  let darkness = color(15, 50, 15, 100); // тёмный зелёный с прозрачностью
  let transparent = color(30, 100, 30, 0);

  // Сколько пикселей тянется затемнение от краёв
  const fadeSize = 60;

  push();
  noStroke();

  // Верхний градиент
  let topGrad = ctx.createLinearGradient(tableX, tableY, tableX, tableY + fadeSize);
  topGrad.addColorStop(0, darkness.toString());
  topGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = topGrad;
  ctx.fillRect(tableX, tableY, tableWidth, fadeSize);

  // Нижний градиент
  let bottomGrad = ctx.createLinearGradient(tableX, tableY + tableHeight, tableX, tableY + tableHeight - fadeSize);
  bottomGrad.addColorStop(0, darkness.toString());
  bottomGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(tableX, tableY + tableHeight - fadeSize, tableWidth, fadeSize);

  // Левый градиент
  let leftGrad = ctx.createLinearGradient(tableX, tableY, tableX + fadeSize, tableY);
  leftGrad.addColorStop(0, darkness.toString());
  leftGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = leftGrad;
  ctx.fillRect(tableX, tableY, fadeSize, tableHeight);

  // Правый градиент
  let rightGrad = ctx.createLinearGradient(tableX + tableWidth, tableY, tableX + tableWidth - fadeSize, tableY);
  rightGrad.addColorStop(0, darkness.toString());
  rightGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = rightGrad;
  ctx.fillRect(tableX + tableWidth - fadeSize, tableY, fadeSize, tableHeight);

  pop();
}


function drawGreenBordersGradient() {
  let mainColor = color(30, 100, 30);
  let darkColor = color(15, 70, 15);
  let lightColor = color(60, 140, 60);

  push();
  noStroke();
  let ctx = drawingContext;

  const borderWidth = 10;
  const offset = 10;  // смещение ярких полосок внутрь

  
  // светлые тонкие полоски — сдвигаем их внутрь бортика на offset пикселей

  // Верхняя светлая полоска
  let topLightGrad = ctx.createLinearGradient(tableX - 20 + offset, tableY - 20 + offset, tableX - 20 + offset, tableY - 20 + offset + borderWidth);
  topLightGrad.addColorStop(0, lightColor.toString());
  topLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = topLightGrad;
  ctx.fillRect(tableX - 20 + offset, tableY - 20 + offset, tableWidth + 40 - 2 * offset, borderWidth);

  // Нижняя светлая полоска
  let bottomLightGrad = ctx.createLinearGradient(tableX - 20 + offset, tableY + tableHeight + 20 - offset, tableX - 20 + offset, tableY + tableHeight + 20 - offset - borderWidth);
  bottomLightGrad.addColorStop(0, lightColor.toString());
  bottomLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = bottomLightGrad;
  ctx.fillRect(tableX - 20 + offset, tableY + tableHeight + 20 - offset - borderWidth, tableWidth + 40 - 2 * offset, borderWidth);

  // Левая светлая полоска
  let leftLightGrad = ctx.createLinearGradient(tableX - 20 + offset, tableY - 20 + offset, tableX - 20 + offset + borderWidth, tableY - 20 + offset);
  leftLightGrad.addColorStop(0, lightColor.toString());
  leftLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = leftLightGrad;
  ctx.fillRect(tableX - 20 + offset, tableY - 20 + offset, borderWidth, tableHeight + 40 - 2 * offset);

  // Правая светлая полоска
  let rightLightGrad = ctx.createLinearGradient(tableX + tableWidth + 20 - offset, tableY - 20 + offset, tableX + tableWidth + 20 - offset - borderWidth, tableY - 20 + offset);
  rightLightGrad.addColorStop(0, lightColor.toString());
  rightLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = rightLightGrad;
  ctx.fillRect(tableX + tableWidth + 20 - offset - borderWidth, tableY - 20 + offset, borderWidth, tableHeight + 40 - 2 * offset);

  pop();
}

function drawPockets() {
  let pockets = getPocketPositions();
  for (let p of pockets) {
  let shadowOffsetX = 0;
  let shadowOffsetY = 0;

  // Определим направление тени по расположению лузы
  if (p.x < tableX + tableWidth / 2) {
    shadowOffsetX = 2;
  } else if (p.x > tableX + tableWidth / 2) {
    shadowOffsetX = -2;
  }

  if (p.y < tableY + tableHeight / 2) {
    shadowOffsetY = 2;
  } else if (p.y > tableY + tableHeight / 2) {
    shadowOffsetY = -2;
  }

  // Тень
  fill(0, 100);
  ellipse(p.x + shadowOffsetX, p.y + shadowOffsetY, pocketDiameter * 1.05);

  // Лунка
  fill(0);
  ellipse(p.x, p.y, pocketDiameter);
}

}

function drawTableMarkings() {
  // --- "D" ---
  let dRadius = tableWidth * 0.10;
  let dCenterX = tableX + tableWidth * 0.25;
  let dCenterY = tableY + tableHeight / 2;

  noFill();
  stroke(255, 200);
  strokeWeight(1.5);
  arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, HALF_PI, -HALF_PI);

  // Линия "D"
  let dLineX = dCenterX + dRadius - 108;
  line(dLineX, tableY, dLineX, tableY + tableHeight);
}

// Остальные функции без изменений
function setupTableBorders(tableX, tableY, tableWidth, tableHeight) {
  const thickness = 50;
  const borders = [
    Matter.Bodies.rectangle(tableX + tableWidth / 2, tableY - thickness / 2, tableWidth, thickness, { isStatic: true }),
    Matter.Bodies.rectangle(tableX + tableWidth / 2, tableY + tableHeight + thickness / 2, tableWidth, thickness, { isStatic: true }),
    Matter.Bodies.rectangle(tableX - thickness / 2, tableY + tableHeight / 2, thickness, tableHeight, { isStatic: true }),
    Matter.Bodies.rectangle(tableX + tableWidth + thickness / 2, tableY + tableHeight / 2, thickness, tableHeight, { isStatic: true })
  ];
  for (let wall of borders) Matter.World.add(engine.world, wall);
}

function getPocketPositions() {
  return [
    { x: tableX, y: tableY },
    { x: tableX + tableWidth / 2, y: tableY },
    { x: tableX + tableWidth, y: tableY },
    { x: tableX, y: tableY + tableHeight },
    { x: tableX + tableWidth / 2, y: tableY + tableHeight },
    { x: tableX + tableWidth, y: tableY + tableHeight },
  ];
}