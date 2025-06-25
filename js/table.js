// table.js

let tableWidth, tableHeight, tableX, tableY, pocketDiameter;

function setupTable(canvasWidth, canvasHeight) {
  tableWidth = canvasWidth * 0.9;
  tableHeight = tableWidth / 2;

  tableX = (canvasWidth - tableWidth) / 2;
  tableY = (canvasHeight - tableHeight) / 2 + 50;

  pocketDiameter = tableWidth / 36 * 1.5;
}

// Функция рисования стола с повёрнутым полукругом D вниз
function drawTable() {
  // --- Деревянный борт с лёгкой текстурой ---
  noStroke();
  for (let i = 0; i < 20; i++) {
    let inter = map(i, 0, 19, 0.4, 0.7);
    fill(102 * inter, 51 * inter, 0);
    rect(tableX - 20 - i, tableY - 20 - i, tableWidth + 40 + i * 2, tableHeight + 40 + i * 2, 30);
  }

  // --- Сукно с мягким градиентом ---
  setGradient(tableX, tableY, tableWidth, tableHeight, color(20, 100, 20), color(10, 60, 10));
  rect(tableX, tableY, tableWidth, tableHeight, 12);

  // --- Лузы с тенью ---
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


  // --- Центр. линия ---
  // stroke(255, 180);
  // strokeWeight(2);
  // line(tableX, tableY + tableHeight / 2, tableX + tableWidth, tableY + tableHeight / 2);

  // --- "D" развернута вниз ---
  let dShift = 600;
  let dRadius = tableWidth * 0.10;
  let dCenterX = tableX + tableWidth - dRadius - pocketDiameter * 2 - dShift;
  let dCenterY = tableY + tableHeight / 2;

  noFill();
  stroke(255);
  arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, HALF_PI, -HALF_PI);

  // Вертикальная линия справа от "D"
  let lineShift = 106;
  let dLineX = dCenterX + dRadius - lineShift;
  strokeWeight(2);
  line(dLineX, tableY, dLineX, tableY + tableHeight);
}


function setupTableBorders(tableX, tableY, tableWidth, tableHeight) {
  const thickness = 50; // толщина стен

  const borders = [
    // Верхняя граница
    Matter.Bodies.rectangle(
      tableX + tableWidth / 2,
      tableY - thickness / 2,
      tableWidth,
      thickness,
      { isStatic: true }
    ),

    // Нижняя граница
    Matter.Bodies.rectangle(
      tableX + tableWidth / 2,
      tableY + tableHeight + thickness / 2,
      tableWidth,
      thickness,
      { isStatic: true }
    ),

    // Левая граница
    Matter.Bodies.rectangle(
      tableX - thickness / 2,
      tableY + tableHeight / 2,
      thickness,
      tableHeight,
      { isStatic: true }
    ),

    // Правая граница
    Matter.Bodies.rectangle(
      tableX + tableWidth + thickness / 2,
      tableY + tableHeight / 2,
      thickness,
      tableHeight,
      { isStatic: true }
    )
  ];

  for (let wall of borders) {
    Matter.World.add(engine.world, wall);
  }
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
function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}