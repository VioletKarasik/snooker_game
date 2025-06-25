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
  // --- Деревянный борт с лёгкой текстурой ---
  noStroke();
  for (let i = 0; i < 20; i++) {
    let inter = map(i, 0, 19, 0.4, 0.7);
    fill(102 * inter, 51 * inter, 0);
    rect(tableX - 20 - i, tableY - 20 - i, tableWidth + 40 + i * 2, tableHeight + 40 + i * 2, 30);
  }

  // --- Основное поле с двойным градиентом ---
  drawFieldWithGradient();
  
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

function drawFieldWithGradient() {
  const borderWidth = 10; // Ширина светлой полосы у бортов
  const darkEdgeWidth = 40; // Ширина темной полосы по краям
  
  // Основной градиент (центр -> края)
  push();
  noStroke();
  
  // Горизонтальные линии (сверху вниз)
  for (let y = tableY; y <= tableY + tableHeight; y++) {
    // Определяем цвет для этой линии
    let c;
    
    // Верхняя светлая полоса (у самого борта)
    if (y < tableY + borderWidth) {
      let inter = map(y, tableY, tableY + borderWidth, 0, 1);
      c = lerpColor(color(60, 140, 60), color(30, 100, 30), inter);
    } 
    // Нижняя светлая полоса (у самого борта)
    else if (y > tableY + tableHeight - borderWidth) {
      let inter = map(y, tableY + tableHeight - borderWidth, tableY + tableHeight, 0, 1);
      c = lerpColor(color(60, 140, 60), color(30, 100, 30), inter);
    }
    // Центральная часть с темными краями
    else {
      // Определяем расстояние до ближайшего вертикального борта (сверху или снизу)
      let distToTopEdge = y - tableY;
      let distToBottomEdge = tableY + tableHeight - y;
      
      // Определяем расстояние до ближайшего горизонтального борта (слева или справа)
      // Это будет использовано позже для вертикальных линий
      
      // Если близко к верхнему или нижнему краю - темнее
      if (distToTopEdge < darkEdgeWidth) {
        let inter = map(distToTopEdge, 0, darkEdgeWidth, 0, 1);
        c = lerpColor(color(15, 70, 15), color(30, 100, 30), inter);
      } else if (distToBottomEdge < darkEdgeWidth) {
        let inter = map(distToBottomEdge, 0, darkEdgeWidth, 0, 1);
        c = lerpColor(color(15, 70, 15), color(30, 100, 30), inter);
      } else {
        c = color(30, 100, 30); // Основной цвет
      }
    }
    
    stroke(c);
    line(tableX, y, tableX + tableWidth, y);
  }
  
  // Вертикальные градиенты (лево-право)
  for (let x = tableX; x <= tableX + tableWidth; x++) {
    // Левый борт (светлее к краю)
    if (x < tableX + borderWidth) {
      let inter = map(x, tableX, tableX + borderWidth, 0, 1);
      let c = lerpColor(color(60, 140, 60), color(30, 100, 30), inter);
      stroke(c);
      line(x, tableY, x, tableY + tableHeight);
    } 
    // Правый борт (светлее к краю)
    else if (x > tableX + tableWidth - borderWidth) {
      let inter = map(x, tableX + tableWidth - borderWidth, tableX + tableWidth, 0, 1);
      let c = lerpColor(color(30, 100, 30), color(60, 140, 60), inter);
      stroke(c);
      line(x, tableY, x, tableY + tableHeight);
    }
    // Центральная часть с темными краями
    else {
      // Определяем расстояние до ближайшего горизонтального борта (слева или справа)
      let distToLeftEdge = x - tableX;
      let distToRightEdge = tableX + tableWidth - x;
      
      // Если близко к левому или правому краю - темнее
      if (distToLeftEdge < darkEdgeWidth) {
        let inter = map(distToLeftEdge, 0, darkEdgeWidth, 0, 1);
        let c = lerpColor(color(15, 70, 15), color(30, 100, 30), inter);
        stroke(c);
        line(x, tableY, x, tableY + tableHeight);
      } else if (distToRightEdge < darkEdgeWidth) {
        let inter = map(distToRightEdge, 0, darkEdgeWidth, 0, 1);
        let c = lerpColor(color(15, 70, 15), color(30, 100, 30), inter);
        stroke(c);
        line(x, tableY, x, tableY + tableHeight);
      } else {
        // Для центральных вертикальных линий используем основной цвет
        stroke(30, 100, 30);
        line(x, tableY, x, tableY + tableHeight);
      }
    }
  }
  
  pop();
  
  // Дополнительная подсветка углов
  drawCornerHighlights(borderWidth);
}

function drawCornerHighlights(size) {
  push();
  noStroke();
  
  // Углы (делаем их немного светлее)
  const cornerSize = size * 0.;
  const cornerAlpha = 60;
  
  // Левый верх
  drawCornerHighlight(tableX, tableY, cornerSize, cornerAlpha);
  // Правый верх
  drawCornerHighlight(tableX + tableWidth, tableY, cornerSize, cornerAlpha);
  // Левый низ
  drawCornerHighlight(tableX, tableY + tableHeight, cornerSize, cornerAlpha);
  // Правый низ
  drawCornerHighlight(tableX + tableWidth, tableY + tableHeight, cornerSize, cornerAlpha);
  
  pop();
}

function drawCornerHighlight(x, y, size, alpha) {
  for (let i = 0; i < size; i++) {
    let currentAlpha = map(i, 0, size, alpha, 0);
    fill(200, 255, 200, currentAlpha);
    ellipse(x, y, size * 2 - i * 2, size * 2 - i * 2);
  }
}

function drawPockets() {
  let pockets = getPocketPositions();
  for (let p of pockets) {
    // Тень
    fill(0, 80);
    noStroke();
    ellipse(p.x + 2, p.y + 2, pocketDiameter * 1.1);
    
    // Сама луза
    fill(0);
    ellipse(p.x, p.y, pocketDiameter);
    
    // Внутренняя подсветка
    fill(40, 40, 40, 150);
    ellipse(p.x, p.y, pocketDiameter * 0.7);
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
  let dLineX = dCenterX + dRadius;
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