// balls.js

let balls = []; // массив всех шаров (кроме cue ball)
let ballDiameter;
let tableParams; // для доступа к параметрам стола (например, tableX, tableY)

const COLORS = {
  cue: 'white',
  red: 'red',
  yellow: 'yellow',
  green: 'green',
  brown: 'brown',
  blue: 'blue',
  pink: 'pink',
  black: 'black'
};

// Пример для упрощения, на старте можно добавить базовые шары с позициями
function setupBalls(tableX, tableY, tableWidth, tableHeight) {
  ballDiameter = tableWidth / 36;
  balls = [];

  // Поставим один красный шар в центр стола для проверки
  let x = tableX + tableWidth / 2;
  let y = tableY + tableHeight / 2;

  balls.push(new Ball(x, y, ballDiameter, 'red'));
}


// Класс для шара с телом matter.js
class Ball {
  constructor(x, y, diameter, color) {
    this.diameter = diameter;
    this.color = color;

    // Создаём тело шарика Matter.js (круг)
    this.body = Matter.Bodies.circle(x, y, diameter / 2, {
      restitution: 0.9,
      friction: 0.05,
      label: 'ball'
    });
    Matter.World.add(engine.world, this.body);
  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    noStroke();
    fill(this.color);
    ellipse(0, 0, this.diameter);
    pop();
  }
}

// Функция для отрисовки всех шаров
function drawBalls() {
  for (let ball of balls) {
    ball.show();
  }
}

// Здесь добавим позже функции для загрузки режимов (1,2,3)
