// cue.js
let isAiming = false;
let cueStartPos = null;
let cueBall = null;
let maxPullDistance = 200;
let minPullDistance = 30;

let useKeyboardAim = false;
let cueAngle = 0; // угол в радианах

function drawCue() {
  if (!cueBall || (!isAiming && !useKeyboardAim)) return;

  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  let dx, dy, distance;

  if (useKeyboardAim) {
    dx = cos(cueAngle);
    dy = sin(cueAngle);
    distance = maxPullDistance;
  } else {
    dx = mouseX - pos.x;
    dy = mouseY - pos.y;
    distance = Math.sqrt(dx * dx + dy * dy);
  }

  let pullDistance = min(distance, maxPullDistance);
  let powerRatio = map(pullDistance, minPullDistance, maxPullDistance, 0, 1);
  powerRatio = constrain(powerRatio, 0, 1);

  dx /= Math.sqrt(dx * dx + dy * dy);
  dy /= Math.sqrt(dx * dx + dy * dy);

  let contactX = pos.x + dx * ballRadius;
  let contactY = pos.y + dy * ballRadius;
  let cueEndX = pos.x + dx * (ballRadius + 50 + pullDistance * 1.5);
  let cueEndY = pos.y + dy * (ballRadius + 50 + pullDistance * 1.5);

  push();
  strokeWeight(3 + powerRatio * 2);
  stroke(210, 180, 140);
  line(contactX, contactY, cueEndX, cueEndY);

  stroke(255);
  strokeWeight(2);
  line(contactX, contactY,
       contactX + dx * ballRadius * 0.8,
       contactY + dy * ballRadius * 0.8);

  if (powerRatio > 0.1) {
    let powerX = contactX + dx * (ballRadius + 10 + pullDistance * 0.5);
    let powerY = contactY + dy * (ballRadius + 10 + pullDistance * 0.5);

    let powerColor = lerpColor(
      color(0, 255, 0),
      color(255, 0, 0),
      powerRatio
    );

    stroke(powerColor);
    strokeWeight(4 + powerRatio * 3);
    line(powerX, powerY,
         powerX + dx * 15,
         powerY + dy * 15);
  }

  pop();
}


function mousePressed() {
  if (!cueBallPlaced) {
    if (isInDZone(mouseX, mouseY) && !isOverlapping(mouseX, mouseY, ballDiameter / 2)) {
      cueBall = new Ball(mouseX, mouseY, ballDiameter, COLORS.cue);
      balls.push(cueBall);
      cueBallPlaced = true;
      return;
    }
    return;
  }

  if (cueBall && cueBall.body.speed < 0.1) {
    isAiming = true;
    cueStartPos = {x: mouseX, y: mouseY};
  }
}

function mouseReleased() {
  if (!isAiming || !cueBall || cueBall.body.speed > 0.1) return;

  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  let dx = mouseX - pos.x;
  let dy = mouseY - pos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance >= minPullDistance) {
    dx /= distance;
    dy /= distance;

    let pullDistance = min(distance, maxPullDistance);
    let powerRatio = map(pullDistance, minPullDistance, maxPullDistance, 0, 1);

    const baseForce = 0.02;
    const force = {
      x: -dx * baseForce * powerRatio,
      y: -dy * baseForce * powerRatio
    };

    let forcePos = {
      x: pos.x + dx * ballRadius * 0.8,
      y: pos.y + dy * ballRadius * 0.8
    };

    Matter.Body.applyForce(cueBall.body, forcePos, force);
  }

  isAiming = false;
  cueStartPos = null;
}


function hitCueBallFromAngle() {
  if (!cueBall || cueBall.body.speed > 0.1) return;

  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  let dx = cos(cueAngle);
  let dy = sin(cueAngle);

  const baseForce = 0.02;
  const force = {
    x: -dx * baseForce,
    y: -dy * baseForce
  };

  const forcePos = {
    x: pos.x + dx * ballRadius * 0.8,
    y: pos.y + dy * ballRadius * 0.8
  };

  Matter.Body.applyForce(cueBall.body, forcePos, force);
}


function keyPressed() {
  if ((key === 'r' || key === 'R') && isAiming) {
    isAiming = false;
    cueStartPos = null;
  }

  if (key === 'k' || key === 'K') {
    useKeyboardAim = !useKeyboardAim;
    isAiming = false;
    cueStartPos = null;
  }

  if (useKeyboardAim) {
    if (keyCode === LEFT_ARROW) cueAngle -= 0.05;
    if (keyCode === RIGHT_ARROW) cueAngle += 0.05;
    if (key === ' ') {
      hitCueBallFromAngle();
    }
  }
}
