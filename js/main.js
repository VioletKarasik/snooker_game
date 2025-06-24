let engine, world;
let table;
let balls = [];
let cue;
let pockets = [];

const TABLE_LENGTH = 720; // пиксели (пример)
const TABLE_WIDTH = 360;
const BALL_DIAMETER = TABLE_WIDTH / 36;
const POCKET_DIAMETER = BALL_DIAMETER * 1.5;

function setup() {
  createCanvas(TABLE_LENGTH + 100, TABLE_WIDTH + 100);
  engine = Matter.Engine.create();
  world = engine.world;
  angleMode(DEGREES);

  table = new Table(TABLE_LENGTH, TABLE_WIDTH);

  pockets = [
    createVector((width - TABLE_LENGTH)/2, (height - TABLE_WIDTH)/2), // верх левый
    createVector(width/2, (height - TABLE_WIDTH)/2),                  // верх центр
    createVector((width + TABLE_LENGTH)/2, (height - TABLE_WIDTH)/2), // верх правый
    createVector((width - TABLE_LENGTH)/2, (height + TABLE_WIDTH)/2), // низ левый
    createVector(width/2, (height + TABLE_WIDTH)/2),                  // низ центр
    createVector((width + TABLE_LENGTH)/2, (height + TABLE_WIDTH)/2)  // низ правый
  ];

  // Создаем белый шар в зоне "D"
  let dRadius = TABLE_WIDTH / 4;
  let cueX = (width - TABLE_LENGTH) / 2 + dRadius / 2;
  let cueY = height / 2;
  balls.push(new Ball(cueX, cueY, BALL_DIAMETER, color(255), true));

  cue = new Cue();

  Matter.Engine.run(engine);
}

function draw() {
  background(0, 100, 20);

  table.show();

  // Рисуем лузы
  noStroke();
  fill(0);
  for (let p of pockets) {
    ellipse(p.x, p.y, POCKET_DIAMETER);
  }

  // Рисуем шары
  for (let ball of balls) {
    ball.show();

    // Проверяем если шар в луже (простая проверка)
    if (ball.isInPocket(pockets)) {
      // Если красный — удаляем
      if (!ball.isCueBall) {
        let idx = balls.indexOf(ball);
        if (idx > -1) balls.splice(idx, 1);
      } else {
        // Если белый — возвращаем в зону D
        let dRadius = TABLE_WIDTH / 4;
        let cueX = (width - TABLE_LENGTH) / 2 + dRadius / 2;
        let cueY = height / 2;
        Body.setPosition(ball.body, { x: cueX, y: cueY });
        Body.setVelocity(ball.body, { x: 0, y: 0 });
      }
    }
  }

  cue.update();
  cue.show();
}

function keyPressed() {
  if (key === ' ') {
    cue.power = cue.maxPower; // устанавливаем силу удара
    cue.hit();
  }
  // TODO: Обработка 1,2,3 режимов размещения шаров
}
