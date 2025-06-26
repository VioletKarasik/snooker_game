// cue.js

let isAiming = false;
let cueStartPos = null;
let cueBall = null;
let maxPullDistance = 200;
let minPullDistance = 30;
let strikeAnimationInProgress = false;
let strikeAnimationProgress = 0;
let strikePower = 0;
let strikeDir = { x: 0, y: 0 };
let strikeForcePos = null;
let strikePhase = 0; // 0 — откат, 1 — удар
const strikeBackDistance = 20; // насколько откатывается кий перед ударом

let useKeyboardAim = false;
let cueAngle = 0; // угол в радианах

const offsetDistance = -15; // Расстояние смещения кий от шара (можно регулировать)

function drawCue() {
  if (!cueBall || (!isAiming && !useKeyboardAim && !strikeAnimationInProgress)) return;


  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  let dx, dy, distance;

  if (strikeAnimationInProgress) {
  // Используем зафиксированное направление удара
  dx = strikeDir.x;
  dy = strikeDir.y;
  distance = maxPullDistance * strikePower; // Можно зафиксировать визуальный pull
} else if (useKeyboardAim) {
  dx = Math.cos(cueAngle);
  dy = Math.sin(cueAngle);
  distance = maxPullDistance;
} else {
  dx = mouseX - pos.x;
  dy = mouseY - pos.y;
  distance = Math.sqrt(dx * dx + dy * dy);
}


  let pullDistance = Math.min(distance, maxPullDistance);
  let powerRatio = map(pullDistance, minPullDistance, maxPullDistance, 0, 1);
  powerRatio = constrain(powerRatio, 0, 1);

  // Нормализация направления
  const dirLength = Math.sqrt(dx * dx + dy * dy);
  if (dirLength !== 0) {
    dx /= dirLength;
    dy /= dirLength;
  }
// Если идёт удар — прогресс от 0 до 1
  // Анимация удара: двухфазная (откат назад, потом удар)
  if (strikeAnimationInProgress) {
    strikeAnimationProgress += 0.1;

    if (strikePhase === 0) {
      // Фаза отката
      if (strikeAnimationProgress >= 1) {
        strikeAnimationProgress = 0;
        strikePhase = 1; // переходим к удару
      }
    } else if (strikePhase === 1) {
      // Фаза удара
      if (strikeAnimationProgress >= 1) {
        strikeAnimationProgress = 1;

        const baseForce = 0.02;
        const force = {
          x: -strikeDir.x * baseForce * strikePower,
          y: -strikeDir.y * baseForce * strikePower
        };
        Matter.Body.applyForce(cueBall.body, strikeForcePos, force);

        strikeAnimationInProgress = false;
      }
    }
  }

  // Вычисляем animatedOffset в зависимости от фазы
  let animatedOffset = offsetDistance;
  if (strikeAnimationInProgress) {
    if (strikePhase === 0) {
      // Откат назад
      animatedOffset = lerp(offsetDistance, offsetDistance - strikeBackDistance, strikeAnimationProgress);
    } else {
      // Удар вперёд
      animatedOffset = lerp(offsetDistance - strikeBackDistance, 0, strikeAnimationProgress);
    }
  }


  // Точка контакта с учетом смещения
  let contactX = pos.x + dx * ballRadius + (-dx) * animatedOffset;
let contactY = pos.y + dy * ballRadius + (-dy) * animatedOffset;

  // Конец кия
  let cueEndX = pos.x + dx * (ballRadius + 50 + pullDistance * 1.5);
let cueEndY = pos.y + dy * (ballRadius + 50 + pullDistance * 1.5);

  push();
  strokeWeight(3 + powerRatio * 2);
  stroke(210,180,140);
  line(contactX, contactY, cueEndX, cueEndY);

  stroke(255);
  strokeWeight(2);
  line(contactX, contactY,
       contactX + dx * ballRadius *0.8,
       contactY + dy * ballRadius*0.8);

   if (powerRatio >0.1) {
     let powerX= contactX + dx*(ballRadius+10+pullDistance*0.5);
     let powerY= contactY + dy*(ballRadius+10+pullDistance*0.5);

     let powerColor= lerpColor(
       color(0,255,0),
       color(255,0,0),
       powerRatio
     );

     stroke(powerColor);
     strokeWeight(4+powerRatio*3);
     line(powerX,powerY,
          powerX+dx*15,
          powerY+dy*15);
   }

   pop();
}

function mousePressed() {
  if (!cueBallPlaced) {
    if (isInDZone(mouseX, mouseY) && !isOverlapping(mouseX, mouseY, ballDiameter/2)) {
      cueBall= new Ball(mouseX, mouseY, ballDiameter,COLORS.cue);
      balls.push(cueBall);
      cueBallPlaced= true;
      return;
    }
    return;
  }

  if (cueBall && cueBall.body.speed<0.1) {
    isAiming= true;
    cueStartPos= {x: mouseX,y: mouseY};
  }
}

function mouseReleased() {
  if (!isAiming || !cueBall || cueBall.body.speed > 0.1) return;

  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  let dx = mouseX - pos.x;
  let dy = mouseY - pos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
    strikeAnimationInProgress = true;
    strikeAnimationProgress = 0;
    strikePhase = 0; // начинаем с отката

  if (distance >= minPullDistance) {
    dx /= distance;
    dy /= distance;

    let pullDistance = Math.min(distance, maxPullDistance);
    strikePower = map(pullDistance, minPullDistance, maxPullDistance, 0, 1);
    strikePower = constrain(strikePower, 0, 1);

    strikeDir = { x: dx, y: dy };
    const offset = offsetDistance;

    strikeForcePos = {
      x: pos.x + dx * ballRadius * 0.8 + (-dx) * offset,
      y: pos.y + dy * ballRadius * 0.8 + (-dy) * offset
    };

    strikeAnimationInProgress = true;
    strikeAnimationProgress = 0;
  }

  isAiming = false;
  cueStartPos = null;
}


function hitCueBallFromAngle() {
   if (!cueBall || cueBall.body.speed>0.1) return;

   const pos= cueBall.body.position;
   const ballRadius= cueBall.diameter/2;

   let dx= Math.cos(cueAngle);
   let dy= Math.sin(cueAngle);

   const baseForce=0.02; 
   
   // Точка приложения силы с учетом смещения
   const forcePos={
     x: pos.x + dx*(ballRadius*0.8)+(-dx)*offsetDistance,
     y: pos.y + dy*(ballRadius*0.8)+(-dy)*offsetDistance
   };

   const force={
     x: -dx*baseForce,
     y: -dy*baseForce
   };

   Matter.Body.applyForce(cueBall.body ,forcePos ,force );
}