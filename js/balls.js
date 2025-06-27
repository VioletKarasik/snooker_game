let balls = [];
let ballDiameter;
let cueBallPlaced = false;
let lastCollisions = {};
let penaltyText = "";        // Текст штрафа (например "-1")
let penaltyAlpha = 0;        // Прозрачность текста (0..255)
let penaltyTimer = 0;        // Таймер для отслеживания показа штрафа
const penaltyDuration = 60;  // Длительность отображения штрафа (в кадрах, 60 ≈ 1 секунда)

const COLORS = {
  cue: 'white',
  red: '#bd2020',
  yellow: '#ccb31f',
  green: '#0c9914',
  brown: '#5f4734',
  blue: '#2569ba',
  pink: '#b94565',
  black: '#262626'
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
    
    // Применяем штраф
    applyPenalty();
  }
}

function applyPenalty() {
  if (isTwoPlayerMode) {
    // Вычитаем штраф из общего счёта игрока
    scores[currentPlayer] = Math.max(0, scores[currentPlayer] - 1);
    
    // Если у тебя есть текущий счёт за подход, можно тоже сбросить или уменьшить:
    score = Math.max(0, score - 1);
    
    // Обновляем UI
    document.getElementById('score1').textContent = scores[0];
    document.getElementById('score2').textContent = scores[1];
    document.getElementById(`current${currentPlayer}`).textContent = score;
  } else {
    score = Math.max(0, score - 1);
    updateScoreDisplay();
  }

  penaltyText = "-1 penalty!";
  penaltyAlpha = 255;
  penaltyTimer = penaltyDuration;
}
function drawPenalty() {
  if (penaltyTimer > 0) {
    penaltyTimer--;

    // Плавное уменьшение прозрачности
    penaltyAlpha = map(penaltyTimer, 0, penaltyDuration, 0, 255);

    push();
    textAlign(CENTER, CENTER);
    textSize(48);
    textFont('Tahoma'); // <-- ВСТАВИЛИ ШРИФТ TAHOMA
    fill(255, 0, 0, penaltyAlpha);
    stroke(255, 0, 0, penaltyAlpha);
    strokeWeight(2);
    text(penaltyText, width / 2, height / 2);
    pop();
  }
}

function addScoreForBall(color) {
  if (color === COLORS.cue) return; // Биток не даёт очков
  
  let points = 0;
  
  if (color === COLORS.red) {
    points = BALL_SCORES.red;
  } else {
    for (let key in COLORS) {
      if (COLORS[key] === color && BALL_SCORES[key]) {
        points = BALL_SCORES[key];
        break;
      }
    }
  }
  
  if (isTwoPlayerMode) {
    score += points; // Текущие очки за подход
    // Обновляем отображение текущих очков для текущего игрока
    document.getElementById(`current${currentPlayer}`).textContent = score;
  } else {
    score += points;
    updateScoreDisplay();
  }
}
let allRedsCleared = false;

function checkColoredBallsPotted() {
  for (let ball of [...balls]) {
    if (ball.color === COLORS.cue) continue;

    if (checkBallInPocket(ball)) {
      // Удаляем шар из мира
      Matter.World.remove(engine.world, ball.body);
      balls = balls.filter(b => b !== ball);

      // Добавляем очки
      addScoreForBall(ball.color);

      if (ball.color === COLORS.red) {
        console.log(`Red ball potted and removed.`);

        // Проверяем, остались ли ещё красные шары
        const redsLeft = balls.some(b => b.color === COLORS.red);
        if (!redsLeft) {
          allRedsCleared = true;
          console.log("All reds cleared! Now color balls can be removed.");
        }

      } else {
        if (!allRedsCleared) {
          // Респавним цветной, только если красные ещё остались
          let respottedBall = new Ball(ball.originalX, ball.originalY, ballDiameter, ball.color);
          balls.push(respottedBall);
          console.log(`Colored ball (${ball.color}) potted and re-spotted.`);
        } else {
          console.log(`Colored ball (${ball.color}) potted and removed.`);
        }
      }
    }
  }

  // Если остался только биток — конец игры
  if (balls.length === 1 && balls[0].color === COLORS.cue) {
    showWinMessage();
  }
}
let gameOver = false;

function showWinMessage() {
  if (!gameOver) { // Проигрываем звук только при первом вызове
    gameOver = true;
    playWinSound(); // Воспроизводим звук победы
  }

  push();
  textAlign(CENTER, CENTER);
  textSize(48);
  textFont('Tahoma');
  fill(0, 255, 0);
  stroke(0);
  strokeWeight(3);
  text("Congratulations! You cleared the table!", width / 2, height / 2);
  pop();
}