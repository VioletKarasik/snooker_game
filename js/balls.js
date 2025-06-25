// balls.js

let balls = []; // все шары вместе с битком
let ballDiameter;

const COLORS = {
  cue: 'white',
  red: 'red',
  yellow: 'yellow',
  green: 'green',
  brown: 'brown',
  blue: 'blue',
  pink: 'plum',
  black: 'black'
};

// Класс шара с физикой Matter.js
class Ball {
  constructor(x, y, diameter, color) {
    this.diameter = diameter;
    this.color = color;

    this.body = Matter.Bodies.circle(x, y, diameter / 2, {
      restitution: 0.9,
      friction: 0.05,
      label: 'ball'
    });
    Matter.World.add(engine.world, this.body);
  }

  show() {
  const pos = this.body.position;
  const r = this.diameter / 2;

  push();
  translate(pos.x, pos.y);
  noStroke();

  // Основа шара — основной цвет
  fill(this.color);
  ellipse(0, 0, this.diameter);

  // Светлый блик
  let highlightColor = color(255, 255, 255, 90); // Белый полупрозрачный
  let bX = -r * 0.4;
  let bY = -r * 0.4;
  let bSize = this.diameter * 0.35;

  fill(highlightColor);
  ellipse(bX, bY, bSize);

  // Легкая тень внизу
  let shadowColor = color(0, 0, 0, 30);
  fill(shadowColor);
  ellipse(0, r * 0.3, bSize * 0.8);

  pop();
}

}

// Функция установки всех шаров на стол
function setupBalls(tableX, tableY, tableWidth, tableHeight) {
  ballDiameter = tableWidth / 36;
  balls = [];

  // 1. Биток (cue ball) - внутри "D" слева
  let cueX = tableX + (tableWidth * 0.15) + (ballDiameter * 1.5);
  let cueY = tableY + tableHeight / 2;
  balls.push(new Ball(cueX, cueY, ballDiameter, COLORS.cue));

  // 2. Красные шары — треугольник справа
  const rackX = tableX + tableWidth * 0.75;
  const rackY = tableY + tableHeight / 2 - ((Math.sqrt(3) / 2) * ballDiameter * 2);
  setupRedBalls(rackX, rackY);

  // 3. Цветные шары на своих позициях
  setupColoredBalls(tableX, tableY, tableWidth, tableHeight);
}

// Рисуем треугольник из 15 красных шаров
function setupRedBalls(rackX, rackY) {
  const rows = 5;
  const spacingY = ballDiameter;
  const spacingX = (Math.sqrt(3) / 2) * ballDiameter;
  const horizontalOffset = -50;
  const verticalOffset = 50; // Добавляем смещение по вертикали

  for (let col = 0; col < rows; col++) {
    let offsetY = - (spacingY * col) / 2;

    for (let i = 0; i <= col; i++) {
      let x = rackX + col * spacingX + horizontalOffset;
      let y = rackY + offsetY + i * spacingY + verticalOffset; // Добавляем смещение к Y
      balls.push(new Ball(x, y, ballDiameter, COLORS.red));
    }
  }
}


// Расставляем цветные шары на столе
function setupColoredBalls(tableX, tableY, tableWidth, tableHeight) {
  const bd = ballDiameter;
  const halfH = tableY + tableHeight / 2;
  const baulkX = tableX + tableWidth * 0.25 + 13;

  // Расстояние между цветными шарами в D по вертикали
  const dOffset = bd * 3.5;

  // Желтый — нижняя точка "D"
  balls.push(new Ball(baulkX, halfH + dOffset, bd, COLORS.yellow));

  // Зеленый — верхняя точка "D"
  balls.push(new Ball(baulkX, halfH - dOffset, bd, COLORS.green));

  // Коричневый — центр "D"
  balls.push(new Ball(baulkX, halfH, bd, COLORS.brown));

  // Синий — центр стола
  balls.push(new Ball(tableX + tableWidth / 2, halfH, bd, COLORS.blue));

  // Розовый — чуть перед пирамидой красных
  balls.push(new Ball(tableX + tableWidth * 0.732 - bd * 2, halfH, bd, COLORS.pink));

  // Черный — ближе к верхнему борту, центр по вертикали
  balls.push(new Ball(tableX + tableWidth - bd * 3, halfH, bd, COLORS.black));
}


// Отрисовка всех шаров
function drawBalls() {
  for (let ball of balls) {
    ball.show();
  }
}
// Проверка: попал ли шар в лузу
function checkBallInPocket(ball) {
  let pockets = getPocketPositions();
  for (let pocket of pockets) {
    let dx = ball.body.position.x - pocket.x;
    let dy = ball.body.position.y - pocket.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < pocketDiameter / 2) {
      return true;
    }
  }
  return false;
}
