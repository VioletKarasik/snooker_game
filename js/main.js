// Matter.js переменные
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events;

let engine;
let world;

// Размеры
let canvasWidth = 1000;
let tableLength = canvasWidth * 0.9;
let tableWidth = tableLength / 2;
let ballDiameter = tableWidth / 36;
let pocketDiameter = ballDiameter * 1.5;

// Массивы шаров
let redBalls = [];
let colorBalls = [];
let cueBall = null;

// Загрузка
function setup() {
  createCanvas(canvasWidth, canvasWidth * 0.65);

  // Matter.js engine
  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0; // Отключаем гравитацию

  // Стол
  setupTable();

  // Создаем режим по умолчанию
  setStartingPosition();

  // Слушаем столкновения
  setupCollisionEvents();
}

function draw() {
  background(30, 120, 30); // Цвет фона = цвет сукна
  Engine.update(engine);

  drawTable();

  // Отрисовка всех шаров
  for (let b of redBalls) b.draw();
  for (let b of colorBalls) b.draw();
  if (cueBall) cueBall.draw();

  // Проверка попаданий в лузу
  checkPockets();
}
function setStartingPosition() {
  redBalls = [];
  colorBalls = [];

  // Пример: создаём 1 красный мяч
  let x = table.x + table.w * 0.6;
  let y = table.y + table.h / 2;
  redBalls.push(new Ball(x, y, 'red', 'red'));

  // Цветной шар — жёлтый
  let y2 = y + 50;
  colorBalls.push(new Ball(x + 50, y2, 'yellow', 'yellow'));
}

function checkPockets() {
  // Красные мячи
  redBalls = redBalls.filter(ball => {
    if (ball.isInPocket(pockets)) {
      ball.remove();
      return false;
    }
    return true;
  });

  // Цветные: возвращаем обратно, если попали
  for (let ball of colorBalls) {
    if (ball.isInPocket(pockets)) {
      Body.setPosition(ball.body, ball.originalPosition || { x: 100, y: 100 });
      Body.setVelocity(ball.body, { x: 0, y: 0 });
    }
  }

  // Cue ball
  if (cueBall && cueBall.isInPocket(pockets)) {
    cueBall.remove();
    cueBall = null;
    // Позже: позволим игроку снова ввести cue ball
  }
}

function setupCollisionEvents() {
  Events.on(engine, 'collisionStart', event => {
    for (let pair of event.pairs) {
      let labels = [pair.bodyA.label, pair.bodyB.label];
      if (labels.includes('cue') && labels.includes('red')) {
        console.log('Cue hit red!');
      } else if (labels.includes('cue') && labels.includes('yellow')) {
        console.log('Cue hit colour!');
      } else if (labels.includes('cue') && labels.includes('cushion')) {
        console.log('Cue hit cushion!');
      }
    }
  });
}
