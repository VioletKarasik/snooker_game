// table.js

let tableWidth, tableHeight, tableX, tableY, pocketDiameter;

function setupTable(canvasWidth, canvasHeight) {
  tableWidth = canvasWidth * 0.9;
  tableHeight = tableWidth / 2;

  tableX = (canvasWidth - tableWidth) / 2;
  tableY = (canvasHeight - tableHeight) / 2;

  pocketDiameter = tableWidth / 36 * 1.5;
}

// Функция рисования стола с повёрнутым полукругом D вниз
function drawTable() {
  fill(102, 51, 0);
  noStroke();
  rect(tableX - 20, tableY - 20, tableWidth + 40, tableHeight + 40, 20);

  fill(20, 100, 20);
  rect(tableX, tableY, tableWidth, tableHeight, 10);

  // Лузы
  fill(0);
  let pockets = getPocketPositions();
  for (let p of pockets) {
    ellipse(p.x, p.y, pocketDiameter);
  }

  // Центр стола — линия
  stroke(255);
  strokeWeight(2);
  line(tableX, tableY + tableHeight / 2, tableX + tableWidth, tableY + tableHeight / 2);

  // --- "D" развернута на 180 градусов ---
  let dShift = 600; // на сколько пикселей влево сдвинуть

  let dRadius = tableWidth * 0.10;
  let dCenterX = tableX + tableWidth - dRadius - pocketDiameter * 2 - dShift; // ← сдвиг влево
  let dCenterY = tableY + tableHeight / 2;

  noFill();
  arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, HALF_PI, -HALF_PI);

  // Вертикальная линия-граница справа от "D"
  let lineShift = 106; // на сколько пикселей влево сдвинуть

  let dLineX = dCenterX + dRadius - lineShift; // правая граница "D"
  let dLineY1 = tableY;
  let dLineY2 = tableY + tableHeight;

  stroke(255);
  strokeWeight(2);
  line(dLineX, dLineY1, dLineX, dLineY2);

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
