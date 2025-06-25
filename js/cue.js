// cue.js
let isAiming = false;

let cueBall = null;
// Показываем кий — линию от битка к курсору
function drawCue() {
  if (!cueBall || !isAiming) {
    console.log("Нет cueBall");
    return;
  }

  const pos = cueBall.body.position;
  const speed = cueBall.body.speed;

  console.log("CueBall speed:", speed);

  stroke(200);
  strokeWeight(3);
  line(pos.x, pos.y, mouseX, mouseY);
}


// Когда нажата кнопка мыши — начинаем прицеливание
function mousePressed() {
  // Если белый еще не поставлен — ставим и выходим
  if (!cueBallPlaced) {
    if (isInDZone(mouseX, mouseY) && !isOverlapping(mouseX, mouseY, ballDiameter / 2)) {
      cueBall = new Ball(mouseX, mouseY, ballDiameter, COLORS.cue);
      balls.push(cueBall);
      cueBallPlaced = true;
      return; // ВАЖНО: не включаем isAiming сразу!
    }
    return; // Клик вне D — игнорируем
  }

  // Если белый уже есть — можно прицеливаться
  if (cueBall && cueBall.body.speed < 0.1) {
    isAiming = true;
  }
}


// Когда отпущена кнопка — применяем силу и отключаем кий
function mouseReleased() {
  if (!cueBall || !isAiming) return;

  const forceScale = 0.0003;
  const force = {
    x: (cueBall.body.position.x - mouseX) * forceScale,
    y: (cueBall.body.position.y - mouseY) * forceScale
  };

  Matter.Body.applyForce(cueBall.body, cueBall.body.position, force);
  isAiming = false;
}
