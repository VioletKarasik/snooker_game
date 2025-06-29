
// Порталы — глобальные переменные
let portalA = { x: 200, y: 150, r: 20 };
let portalB = { x: 600, y: 380, r: 20 };
let particles = [];
let missedShots = 0;
let portalsActive = true;

function onPlayerShot(hitPocket) {
  if (!hitPocket) {
    missedShots++;
    console.log(`Missed shot #${missedShots}`);
  } else {
    missedShots = 0; // сброс счетчика при попадании
  }
  
  if (missedShots > 0 && missedShots % 3 === 0) {
    if (!ballsMoving()) {
      spawnPortalsRandomly();
      portalsActive = true;
      console.log("Portals respawned randomly after 3 consecutive missed shots.");
    } else {
      console.log("Balls still moving, can't spawn portals now");
    }
  }
}



function spawnPortalsRandomly() {
  const margin = 50; // Отступ от краёв стола, чтобы порталы не были на самом краю

  portalA.x = random(tableX + margin, tableX + tableWidth - margin);
  portalA.y = random(tableY + margin, tableY + tableHeight - margin);

  portalB.x = random(tableX + margin, tableX + tableWidth - margin);
  portalB.y = random(tableY + margin, tableY + tableHeight - margin);
}


function removePortals() {
  portalsActive = false;
}

function drawPortals() {
  drawFancyPortal(portalA.x, portalA.y, color(100, 100, 255), frameCount * 0.05);
  drawFancyPortal(portalB.x, portalB.y, color(200, 100, 255), -frameCount * 0.05);
}

function drawFancyPortal(x, y, baseColor, spinOffset = 0) {
  push();
  translate(x, y);
  noFill();

  // Внешнее свечение
  for (let i = 0; i < 8; i++) {
    stroke(red(baseColor), green(baseColor), blue(baseColor), 20 - i * 2);
    strokeWeight(10 - i);
    ellipse(0, 0, 40 + i * 4);
  }

  // Вращающаяся спираль
  stroke(baseColor);
  strokeWeight(2);
  for (let a = 0; a < TWO_PI; a += 0.2) {
    let r = 10 + a * 6;
    let px = cos(a + spinOffset) * r;
    let py = sin(a + spinOffset) * r;
    point(px, py);
  }

  // Мерцающие частицы
  // Добавляем новую частицу примерно раз в 10 кадров, если нужно
  if (frameCount % 10 === 0 && particles.length < 8) {
    particles.push({
      angle: random(TWO_PI),
      radius: random(12, 28),
      size: random(1.5, 4),
      speed: random(0.006, 0.01), // ЗАМЕДЛИЛ скорость вращения
      alpha: random(80, 180),
      life: random(80, 150)        // Увеличил жизнь частицы для медленного исчезания
    });
  }

  // Обновляем и рисуем частицы
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.angle += p.speed;
    p.life--;
    p.alpha *= 0.995;  // ЗАМЕДЛИЛ уменьшение прозрачности

    if (p.life > 0 && p.alpha > 1) {
      let px = cos(p.angle) * p.radius;
      let py = sin(p.angle) * p.radius;
      
      fill(
        lerp(red(baseColor), 255, 0.7),
        lerp(green(baseColor), 255, 0.7),
        lerp(blue(baseColor), 255, 0.7),
        p.alpha
      );
      noStroke();
      ellipse(px, py, p.size, p.size);

      if (random() > 0.7) {
        fill(255, p.alpha * 0.3);
        ellipse(px, py, p.size * 2, p.size * 2);
      }
    } else {
      // Удаляем частицу, если "жизнь" закончилась
      particles.splice(i, 1);
    }
  }
  
  pop();
}



function checkPortal(ball) {
    if (!portalsActive) return;
  const now = millis();
  if (!ball.lastTeleportTime) ball.lastTeleportTime = 0;
  
  const cooldown = 500; // миллисекунд между телепортациями

  if (now - ball.lastTeleportTime < cooldown) return;

  const radius = ball.circleRadius || 10; // запасное значение

  if (dist(ball.position.x, ball.position.y, portalA.x, portalA.y) < portalA.r + radius) {
    teleportBall(ball, portalB);
    ball.lastTeleportTime = now;
  } else if (dist(ball.position.x, ball.position.y, portalB.x, portalB.y) < portalB.r + radius) {
    teleportBall(ball, portalA);
    ball.lastTeleportTime = now;
  }
}


function teleportBall(ball, targetPortal) {
  // Направление выхода: случайный угол или направление от центра
  let angle = random(TWO_PI);
  let offset = 30; // Насколько далеко от центра портала выкидывать шар

  let newX = targetPortal.x + offset * cos(angle);
  let newY = targetPortal.y + offset * sin(angle);

  Matter.Body.setPosition(ball, { x: newX, y: newY });

  // Опционально — придаём небольшую скорость наружу
  Matter.Body.setVelocity(ball, {
    x: 3 * cos(angle),
    y: 3 * sin(angle),
  });
}
