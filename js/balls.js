let balls = [];
let ballDiameter;
let cueBallPlaced = false;
let lastCollisions = {};

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

const BALL_SCORES = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7
};


class Ball {
  constructor(x, y, diameter, color) {
    this.diameter = diameter;
    this.color = color;

    this.originalX = x;
    this.originalY = y;

    this.body = Matter.Bodies.circle(x, y, diameter / 2, {
      restitution: 0.9,
      friction: 0.05,
      label: 'ball'
    });
    this.body.color = color;
    Matter.World.add(engine.world, this.body);
  }

  resetPosition() {
    Matter.Body.setPosition(this.body, { x: this.originalX, y: this.originalY });
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(this.body, 0);
    Matter.Body.setAngle(this.body, 0);
  }

  show() {
    const pos = this.body.position;
    const r = this.diameter / 2;

    push();
    translate(pos.x, pos.y);
    noStroke();
    fill(this.color);
    ellipse(0, 0, this.diameter);

    fill(255, 255, 255, 90);
    ellipse(-r * 0.4, -r * 0.4, this.diameter * 0.35);

    fill(0, 0, 0, 30);
    ellipse(0, r * 0.3, this.diameter * 0.28);
    pop();
  }
}

function setupCollisionDetection() {
  // Обработчик столкновений Matter.js
  Matter.Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;
    
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      
      // Проверяем, участвует ли в столкновении биток
      const cueBallInvolved = 
        (pair.bodyA.label === 'ball' && pair.bodyA.color === COLORS.cue) ||
        (pair.bodyB.label === 'ball' && pair.bodyB.color === COLORS.cue);
      
      if (!cueBallInvolved) continue;
      
      // Определяем какой объект биток, а какой другой
      let cueBody, otherBody;
      if (pair.bodyA.color === COLORS.cue) {
        cueBody = pair.bodyA;
        otherBody = pair.bodyB;
      } else {
        cueBody = pair.bodyB;
        otherBody = pair.bodyA;
      }
      
      // Определяем тип столкновения
      let collisionType;
      
      if (otherBody.label === 'ball') {
        // Столкновение с другим шаром
        if (otherBody.color === COLORS.red) {
          collisionType = 'cue-red';
        } else {
          collisionType = 'cue-color';
        }
      } else {
        // Столкновение с бортом
        collisionType = 'cue-cushion';
      }
      
      // Проверяем, не было ли уже такого столкновения недавно
      const collisionKey = `${cueBody.id}-${otherBody.id}`;
      if (!lastCollisions[collisionKey] || Date.now() - lastCollisions[collisionKey] > 500) {
        // Показываем сообщение о столкновении
        showCollisionMessage(collisionType);
        lastCollisions[collisionKey] = Date.now();
      }
    }
  });
}

function showCollisionMessage(type) {
  let message = '';
  
  switch(type) {
    case 'cue-red':
      message = 'Cue ball hit a red ball!';
      break;
    case 'cue-color':
      message = 'Cue ball hit a colored ball!';
      break;
    case 'cue-cushion':
      message = 'Cue ball hit the cushion!';
      break;
    default:
      message = 'Cue ball collision detected!';
  }
  
  // Выводим сообщение в консоль (можно заменить на отображение в интерфейсе)
  console.log(message);
  
  // Если у вас есть элемент для отображения сообщений:
  const messageElement = document.getElementById('collision-message');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Скрываем сообщение через 2 секунды
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 2000);
  }
}


function clearAllBalls() {
  for (let ball of balls) {
    Matter.World.remove(engine.world, ball.body);
  }
  balls = [];
}

function setupBalls(tableX, tableY, tableWidth, tableHeight) {
  ballDiameter = tableWidth / 36;
  clearAllBalls();

  const rackX = tableX + tableWidth * 0.75;
  const rackY = tableY + tableHeight / 2 - ((Math.sqrt(3) / 2) * ballDiameter * 2);
  setupRedBalls(rackX, rackY);

  setupColoredBalls(tableX, tableY, tableWidth, tableHeight);
}
function isInDZone(x, y) {
  let dRadius = tableWidth * 0.10;
  let dCenterX = tableX + tableWidth * 0.25;
  let dCenterY = tableY + tableHeight / 2;

  let dx = x - dCenterX;
  let dy = y - dCenterY;

  // Проверка: внутри круга и левее центра (левая полусфера)
  if (dx <= 0 && dx * dx + dy * dy <= dRadius * dRadius) {
    return true;
  }
  return false;
}


function setupRedBalls(rackX, rackY) {
  const rows = 5;
  const spacingY = ballDiameter;
  const spacingX = (Math.sqrt(3) / 2) * ballDiameter;
  const hOffset = -50;
  const vOffset = 50;

  for (let col = 0; col < rows; col++) {
    let offsetY = -(spacingY * col) / 2;
    for (let i = 0; i <= col; i++) {
      let x = rackX + col * spacingX + hOffset;
      let y = rackY + offsetY + i * spacingY + vOffset;
      balls.push(new Ball(x, y, ballDiameter, COLORS.red));
    }
  }
}

function setupColoredBalls(tableX, tableY, tableWidth, tableHeight) {
  const bd = ballDiameter;
  const halfH = tableY + tableHeight / 2;
  const baulkX = tableX + tableWidth * 0.25;
  const dOffset = bd * 3.5;

  balls.push(new Ball(baulkX, halfH + dOffset, bd, COLORS.yellow));
  balls.push(new Ball(baulkX, halfH - dOffset, bd, COLORS.green));
  balls.push(new Ball(baulkX, halfH, bd, COLORS.brown));
  balls.push(new Ball(tableX + tableWidth / 2, halfH, bd, COLORS.blue));
  balls.push(new Ball(tableX + tableWidth * 0.732 - bd * 2, halfH, bd, COLORS.pink));
  balls.push(new Ball(tableX + tableWidth - bd * 3, halfH, bd, COLORS.black));
}

function isOverlapping(x, y, radius) {
  for (let ball of balls) {
    const dx = ball.body.position.x - x;
    const dy = ball.body.position.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < (ball.diameter / 2 + radius)) return true;
  }
  return false;
}

function setupRandomRedBallsOnly() {
  clearAllBalls();
  ballDiameter = tableWidth / 36;

  let attempts = 0;
  while (balls.length < 15 && attempts < 1000) {
    let x = random(tableX + ballDiameter, tableX + tableWidth - ballDiameter);
    let y = random(tableY + ballDiameter, tableY + tableHeight - ballDiameter);
    if (!isOverlapping(x, y, ballDiameter / 2)) {
      balls.push(new Ball(x, y, ballDiameter, COLORS.red));
    }
    attempts++;
  }

}

function setupRandomAllBalls() {
  clearAllBalls();
  ballDiameter = tableWidth / 36;

  let attempts = 0;
  // Красные
  while (balls.length < 15 && attempts < 1000) {
    let x = random(tableX + ballDiameter, tableX + tableWidth - ballDiameter);
    let y = random(tableY + ballDiameter, tableY + tableHeight - ballDiameter);
    if (!isOverlapping(x, y, ballDiameter / 2)) {
      balls.push(new Ball(x, y, ballDiameter, COLORS.red));
    }
    attempts++;
  }

  // Цветные
  const colorKeys = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  for (let color of colorKeys) {
    let placed = false;
    let tries = 0;
    while (!placed && tries < 200) {
      let x = random(tableX + ballDiameter, tableX + tableWidth - ballDiameter);
      let y = random(tableY + ballDiameter, tableY + tableHeight - ballDiameter);
      if (!isOverlapping(x, y, ballDiameter / 2)) {
        balls.push(new Ball(x, y, ballDiameter, COLORS[color]));
        placed = true;
      }
      tries++;
    }
  }

}

function mousePressed() {
  // Если биток ещё не размещён, размещаем биток по месту клика
  if (!cueBallPlaced) {
    // Создаём биток там, где кликнули
    cueBall = new Ball(mouseX, mouseY, ballDiameter, COLORS.cue);
    balls.push(cueBall);
    cueBallPlaced = true;
  }
}


function drawBalls() {
  for (let ball of balls) {
    ball.show();
  }
}

function ballsMoving() {
  for (let ball of balls) {
    const v = ball.body.velocity;
    if (Math.abs(v.x) > 0.1 || Math.abs(v.y) > 0.1) return true;
  }
  return false;
}

function resetAllBalls() {
  if (ballsMoving()) return;
  for (let ball of balls) {
    ball.resetPosition();
  }
}

function checkBallInPocket(ball) {
  const pockets = getPocketPositions(); // предполагается, что она определена
  for (let pocket of pockets) {
    const dx = ball.body.position.x - pocket.x;
    const dy = ball.body.position.y - pocket.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < pocketDiameter / 2) {
      return true;
    }
  }
  return false;
}
function checkCueBallPotted() {
  if (!cueBall) return;

  if (checkBallInPocket(cueBall)) {
    // Удаляем биток из физического мира
    Matter.World.remove(engine.world, cueBall.body);

    // Удаляем из массива шаров
    balls = balls.filter(ball => ball !== cueBall);

    // Сбрасываем флаг и ссылку
    cueBall = null;
    cueBallPlaced = false;

    console.log("Cue ball potted. Place it again in the D zone.");
  }
}
function addScoreForBall(color) {
  if (color === COLORS.cue) return; // Биток не даёт очков
  if (color === COLORS.red) {
    score += BALL_SCORES.red;
  } else {
    // Цветные
    for (let key in COLORS) {
      if (COLORS[key] === color && BALL_SCORES[key]) {
        score += BALL_SCORES[key];
        break;
      }
    }
  }
  updateScoreDisplay();
}

function checkColoredBallsPotted() {
  for (let ball of [...balls]) {
    if (ball.color === COLORS.cue) continue;

    if (checkBallInPocket(ball)) {
      // Удаляем шар из мира
      Matter.World.remove(engine.world, ball.body);

      // Удаляем из массива
      balls = balls.filter(b => b !== ball);

      // Добавляем очки
      addScoreForBall(ball.color);

      if (ball.color === COLORS.red) {
        console.log(`Red ball potted and removed.`);
      } else {
        // Цветные респавнятся
        let respottedBall = new Ball(ball.originalX, ball.originalY, ballDiameter, ball.color);
        balls.push(respottedBall);
        console.log(`Colored ball (${ball.color}) potted and re-spotted.`);
      }
    }
  }
}