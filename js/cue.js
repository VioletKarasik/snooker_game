let isAiming = false; // Is the player currently aiming?
let cueStartPos = null; // Starting mouse position when aiming begins
let cueBall = null; // Reference to the cue (white) ball
let maxPullDistance = 200; // Maximum distance the cue can be pulled
let minPullDistance = 30; // Minimum pull distance to register a shot
let strikeAnimationInProgress = false; // Whether the strike animation is running
let strikeAnimationProgress = 0; // Animation progress (0 to 1)
let strikePower = 0; // Power of the shot, based on pull distance
let strikeDir = { x: 0, y: 0 }; // Direction of the strike
let strikeForcePos = null; // Where the force should be applied on the ball
let strikePhase = 0; // Animation phase: 0 = pull back, 1 = hit
const strikeBackDistance = 20; // How far the cue moves back before hitting
let cueHitSound = null; // Sound of the cue hitting the ball
let soundReady = false; // Whether sound is ready
let soundAllowed = false; // Whether the user has enabled sound
let winSound = null; // Sound played when the game ends
let showAimGuide = false; // Whether to show the aiming guide
let useKeyboardAim = false; // Whether aiming is controlled by keyboard
let cueAngle = 0; // Angle of the cue in radians
const offsetDistance = -15; // Distance to offset the cue from ball center

function drawCue() {
  if (!isNearTable(mouseX, mouseY)) {
    // Reset aiming state if the mouse leaves the table area
    isAiming = false;
    cueStartPos = null;
    return;
  }

  // Do not draw cue if ball is not present or no interaction is needed
  if (!cueBall || (!isAiming && !useKeyboardAim && !strikeAnimationInProgress && !showAimGuide)) return;

  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  // Determine direction and pull distance
  let dx, dy, distance;

  if (strikeAnimationInProgress) {
    // Use fixed direction during strike animation
    dx = strikeDir.x;
    dy = strikeDir.y;
    distance = maxPullDistance * strikePower;
  } else if (useKeyboardAim) {
    dx = Math.cos(cueAngle);
    dy = Math.sin(cueAngle);
    distance = maxPullDistance;
  } else {
    dx = mouseX - pos.x;
    dy = mouseY - pos.y;
    distance = Math.sqrt(dx * dx + dy * dy);
  }

  // Normalize direction
  const dirLength = Math.sqrt(dx * dx + dy * dy);
  if (dirLength !== 0) {
    dx /= dirLength;
    dy /= dirLength;
  }

  // Calculate pull power ratio (used for stroke weight and color)
  let pullDistance = Math.min(distance, maxPullDistance);
  let powerRatio = map(pullDistance, minPullDistance, maxPullDistance, 0, 1);
  powerRatio = constrain(powerRatio, 0, 1);

  // Handle cue animation phases
  if (strikeAnimationInProgress) {
    strikeAnimationProgress += 0.1;

    if (strikePhase === 0 && strikeAnimationProgress >= 1) {
      // End of pull-back phase
      strikeAnimationProgress = 0;
      strikePhase = 1;
    } else if (strikePhase === 1 && strikeAnimationProgress >= 1) {
      // Hit phase: apply force to cue ball
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

  // Calculate animated offset (used to draw the cue moving)
  let animatedOffset = offsetDistance;
  if (strikeAnimationInProgress) {
    if (strikePhase === 0) {
      animatedOffset = lerp(offsetDistance, offsetDistance - strikeBackDistance, strikeAnimationProgress);
    } else {
      animatedOffset = lerp(offsetDistance - strikeBackDistance, 0, strikeAnimationProgress);
    }
  }

  // Calculate contact and end points of the cue
  let contactX = pos.x + dx * ballRadius + (-dx) * animatedOffset;
  let contactY = pos.y + dy * ballRadius + (-dy) * animatedOffset;

  let cueEndX = pos.x + dx * (ballRadius + 50 + pullDistance * 1.5);
  let cueEndY = pos.y + dy * (ballRadius + 50 + pullDistance * 1.5);

  // Draw the cue
  push();
  strokeWeight(3 + powerRatio * 2);
  stroke(210, 180, 140); // Light brown cue
  line(contactX, contactY, cueEndX, cueEndY);

  // Small white tip of the cue
  stroke(255);
  strokeWeight(2);
  line(contactX, contactY,
       contactX + dx * ballRadius * 0.8,
       contactY + dy * ballRadius * 0.8);

  // Power indicator line (green to red based on power)
  if (powerRatio > 0.1) {
    let powerX = contactX + dx * (ballRadius + 10 + pullDistance * 0.5);
    let powerY = contactY + dy * (ballRadius + 10 + pullDistance * 0.5);

    let powerColor = lerpColor(
      color(0, 255, 0), // green
      color(255, 0, 0), // red
      powerRatio
    );

    stroke(powerColor);
    strokeWeight(4 + powerRatio * 3);
    line(powerX, powerY,
         powerX + dx * 15,
         powerY + dy * 15);
  }

  // Aiming guide (dashed red line)
  if (showAimGuide && !strikeAnimationInProgress) {
    let dashLength = 10;
    let gapLength = 10;
    let aimLength = 300;

    stroke(255, 0, 0, 150);
    strokeWeight(2);

    let offsetDistance = -60;
    let x0 = contactX + dx * offsetDistance;
    let y0 = contactY + dy * offsetDistance;
    let x1 = contactX - dx * aimLength;
    let y1 = contactY - dy * aimLength;

    let totalLength = dist(x0, y0, x1, y1);
    let steps = totalLength / (dashLength + gapLength);

    for (let i = 0; i < steps; i++) {
      let t1 = i * (dashLength + gapLength) / totalLength;
      let t2 = t1 + dashLength / totalLength;
      if (t2 > 1) t2 = 1;

      let sx = lerp(x0, x1, t1);
      let sy = lerp(y0, y1, t1);
      let ex = lerp(x0, x1, t2);
      let ey = lerp(y0, y1, t2);

      line(sx, sy, ex, ey);
    }
  }
  pop();
}

function loadCueSounds() {
  // Attempt to load cue hit sound from multiple paths
  const soundPaths = [
    'assets/cue.mp3',
    './assets/cue.mp3',
    'sounds/cue.mp3',
    './sounds/cue.mp3',
    'cue.mp3'
  ];

  for (let path of soundPaths) {
    try {
      cueHitSound = loadSound(path, () => {
        console.log('Sound loaded from:', path);
        soundReady = true;
      }, () => {
        console.log('Failed to load from:', path);
      });
      break;
    } catch (e) {
      console.warn('Error loading sound from:', path, e);
    }
  }

  winSound = loadSound('assets/endgame.mp3', () => {
    console.log('Win sound loaded');
  }, (err) => {
    console.error('Failed to load win sound:', err);
  });
}

function playWinSound() {
  if (!winSound) {
    console.warn('Victory sound not loaded');
    return;
  }

  try {
    winSound.setVolume(0.7); // Volume can be adjusted
    winSound.rate(1.0); // Playback speed
    winSound.play();
  } catch (err) {
    console.error('Error playing victory sound:', err);
  }
}
function playCueSound(volume = 0.5, rate = 0.7) {
  if (!cueHitSound) {
    console.warn('Cue sound not loaded');
    return;
  }
  setTimeout(() => {
    try {
      if (!soundAllowed) {
        userStartAudio().then(() => {
          soundAllowed = true;
          cueHitSound.setVolume(volume);
          cueHitSound.rate(rate);
          cueHitSound.play();
        }).catch(err => {
          console.error('Audio context error:', err);
        });
      } else {
        cueHitSound.setVolume(volume);
        cueHitSound.rate(rate);
        cueHitSound.play();
      }
    } catch (err) {
      console.error('Playback error:', err);
    }
  }, 1000);
}

function mousePressed() {
  // Place the cue ball if not placed yet
  if (!cueBallPlaced) {
    if (gameStarted && isInDZone(mouseX, mouseY) && !isOverlapping(mouseX, mouseY, ballDiameter / 2)) {
      cueBall = new Ball(mouseX, mouseY, ballDiameter, COLORS.cue);
      balls.push(cueBall);
      cueBallPlaced = true;
      return false;
    }
    return false;
  }

  // Begin aiming if game is active and cue ball is still
  if (gameStarted && cueBall && cueBall.body.speed < 0.1) {
    isAiming = true;
    cueStartPos = { x: mouseX, y: mouseY };
    return false;
  }

  return true;
}

function mouseReleased() {
  // Cancel aiming if mouse is outside table
  if (!isNearTable(mouseX, mouseY)) {
    isAiming = false;
    cueStartPos = null;
    return false;
  }

  // Only proceed if we were aiming and the cue ball is still
  if (!gameStarted || !isAiming || !cueBall || cueBall.body.speed > 0.1) return false;

  showAimGuide = false;
  isAiming = false;
  cueStartPos = null;

  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  let dx = mouseX - pos.x;
  let dy = mouseY - pos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance >= minPullDistance) {
    dx /= distance;
    dy /= distance;

    let pullDistance = Math.min(distance, maxPullDistance);
    strikePower = map(pullDistance, minPullDistance, maxPullDistance, 0, 1);
    strikePower = constrain(strikePower, 0, 1);

    strikeDir = { x: dx, y: dy };

    strikeForcePos = {
      x: pos.x + dx * ballRadius * 0.8 + (-dx) * offsetDistance,
      y: pos.y + dy * ballRadius * 0.8 + (-dy) * offsetDistance
    };

    strikeAnimationInProgress = true;
    strikeAnimationProgress = 0;
    strikePhase = 0;

    if (cueHitSound) {
      playCueSound(strikePower * 0.7 + 0.3, strikePower * 0.5 + 0.8);
    }
    console.log("Cue hit (mouse) at", Date.now());
    wasStrokeMade = true;
    previousPlayerScore = score;
    shouldCheckTurnEnd = true;
    lastHitTime = Date.now(); 
    resetCurrentPlayerTimer();
  }

  return false;
}

function hitCueBallFromAngle() {
  // Reset timer if in 2-player mode
  if (isTwoPlayerMode) {
    timers[currentPlayer - 1] = 30;
    document.getElementById(`timer${currentPlayer}`).textContent = '30';
  }

  if (!cueBall || cueBall.body.speed > 0.1) return;

  const pos = cueBall.body.position;
  const ballRadius = cueBall.diameter / 2;

  let dx = Math.cos(cueAngle);
  let dy = Math.sin(cueAngle);

  const baseForce = 0.02;

  const forcePos = {
    x: pos.x + dx * (ballRadius * 0.8) + (-dx) * offsetDistance,
    y: pos.y + dy * (ballRadius * 0.8) + (-dy) * offsetDistance
  };

  const force = {
    x: -dx * baseForce,
    y: -dy * baseForce
  };

  Matter.Body.applyForce(cueBall.body, forcePos, force);

  // Play sound
  if (cueHitSound) {
    cueHitSound.setVolume(0.8);
    cueHitSound.rate(1.0);
    cueHitSound.play();
  }
  console.log("Cue hit (keyboard) at", Date.now());
  wasStrokeMade = true;
  previousPlayerScore = score;
  shouldCheckTurnEnd = true;
  lastHitTime = Date.now(); // Запоминаем время удара
}
