// cue.js
let isAiming = false;

// Показываем кий — линию от битка к курсору
function drawCue() {
  const cueBall = balls[0];
  const pos = cueBall.body.position;

  // Кий рисуется, только если мышь зажата и биток почти не двигается
  const speed = cueBall.body.speed;
  if (isAiming && speed < 0.1) {
    stroke(200);
    strokeWeight(3);
    line(pos.x, pos.y, mouseX, mouseY);
  }
}

// Когда нажата кнопка мыши — начинаем прицеливание
function mousePressed() {
  const cueBall = balls[0];
  if (cueBall.body.speed < 0.1) {
    isAiming = true;
  }
}

// Когда отпущена кнопка — применяем силу и отключаем кий
function mouseReleased() {
  const cueBall = balls[0];
  if (isAiming) {
    const forceScale = 0.0003; // сила удара
    const force = {
      x: (cueBall.body.position.x - mouseX) * forceScale,
      y: (cueBall.body.position.y - mouseY) * forceScale
    };
    Matter.Body.applyForce(cueBall.body, cueBall.body.position, force);
  }

  isAiming = false;
}
