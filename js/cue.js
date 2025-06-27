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
// let cueHitSound = null;

// // Функция для предзагрузки звука (должна вызываться в setup() или preload())
// function loadCueSounds() {
//   cueHitSound = loadSound('cue.mp3'); // или cue_hit.wav, cue_hit.ogg
// }
function drawCue() {
  if (!isNearTable(mouseX, mouseY)) {
    // Сбрасываем состояние прицеливания, если курсор ушел со стола
    isAiming = false;
    cueStartPos = null;
    return;
  }
  if (!isNearTable(mouseX, mouseY)) return;
  if (!cueBall || (!isAiming && !useKeyboardAim && !strikeAnimationInProgress && !showAimGuide)) return;

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
if (showAimGuide && !strikeAnimationInProgress) {
  // Пунктирная линия назад — прицел
let dashLength = 10;
let gapLength = 10;
let aimLength = 300;

stroke(255, 0, 0, 150); // Красный с прозрачностью
strokeWeight(2);

let offsetDistance = -60; // на сколько подальше от шара
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

function mousePressed() {
  // Размещение битка (работает только после начала игры)
  if (!cueBallPlaced) {
    if (gameStarted && isInDZone(mouseX, mouseY) && !isOverlapping(mouseX, mouseY, ballDiameter/2)) {
      cueBall = new Ball(mouseX, mouseY, ballDiameter, COLORS.cue);
      balls.push(cueBall);
      cueBallPlaced = true;
      return false;
    }
    return false;
  }

  // Управление кием (работает только после начала игры и размещения битка)
  if (gameStarted && cueBall && cueBall.body.speed < 0.1) {
    isAiming = true;
    cueStartPos = {x: mouseX, y: mouseY};
    return false;
  }
  
  return true;
}
let cueHitSound = null;
let soundReady = false;
let soundAllowed = false;
let winSound = null; // Добавляем рядом с другими переменными звуков
function loadCueSounds() {
  // Проверяем доступность p5.sound
  if (typeof loadSound === 'undefined') {
    console.error('p5.sound library not loaded!');
    return;
  }
  
  // Пробуем несколько возможных путей
  const soundPaths = [
    'assets/cue.mp3',
    './assets/cue.mp3',
    'sounds/cue.mp3',
    './sounds/cue.mp3',
    'cue.mp3'
  ];
  
  // Пробуем загрузить по каждому пути
  for (let path of soundPaths) {
    try {
      cueHitSound = loadSound(path, () => {
        console.log('Звук успешно загружен по пути:', path);
        soundReady = true;
      }, (err) => {
        console.log('Не удалось загрузить по пути:', path);
      });
      break; // Прерываем цикл при первой успешной загрузке
    } catch (e) {
      console.warn('Ошибка загрузки:', path, e);
    }
  }
  
  if (!cueHitSound) {
    console.error('Не удалось загрузить звук ни по одному из путей');
  }
  winSound = loadSound('assets/endgame.mp3', () => {
    console.log('Звук победы загружен');
  }, (err) => {
    console.error('Ошибка загрузки звука победы:', err);
  });
}
function playWinSound() {
  if (!winSound) {
    console.warn('Звук победы не загружен');
    return;
  }
  
  try {
    winSound.setVolume(0.7); // Громкость можно регулировать
    winSound.rate(1.0); // Скорость воспроизведения
    winSound.play();
  } catch (err) {
    console.error('Ошибка воспроизведения звука победы:', err);
  }
}
// Новая функция для безопасного воспроизведения
function playCueSound(volume = 0.5, rate = 0.7) {
  if (!cueHitSound) {
    console.warn('Звук не загружен');
    return;
  }
  
  // Добавляем задержку 2000 мс (2 секунды)
  setTimeout(() => {
    try {
      // Разрешаем аудиоконтекст при первом воспроизведении
      if (!soundAllowed) {
        userStartAudio().then(() => {
          soundAllowed = true;
          cueHitSound.setVolume(volume);
          cueHitSound.rate(rate);
          cueHitSound.play();
        }).catch(err => {
          console.error('Ошибка разрешения аудио:', err);
        });
      } else {
        cueHitSound.setVolume(volume);
        cueHitSound.rate(rate);
        cueHitSound.play();
      }
    } catch (err) {
      console.error('Ошибка воспроизведения:', err);
    }
  }, 1000); // 2000 мс = 2 секунды
}
function mouseReleased() {
  // Проверяем, что курсор находится над столом
  if (!isNearTable(mouseX, mouseY)) {
    // Сбрасываем состояние прицеливания, если курсор вне стола
    isAiming = false;
    cueStartPos = null;
    return false;
  }

  if (!gameStarted || !isAiming || !cueBall || cueBall.body.speed > 0.1) return false;
  
  // Отключаем прицеливание и скрываем кий при ударе
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
  const offset = offsetDistance;

  strikeForcePos = {
    x: pos.x + dx * ballRadius * 0.8 + (-dx) * offset,
    y: pos.y + dy * ballRadius * 0.8 + (-dy) * offset
  };

  strikeAnimationInProgress = true;
  strikeAnimationProgress = 0;
  strikePhase = 0; // начинаем с отката

  // Воспроизведение звука удара
  // В mouseReleased():
if (cueHitSound) {
 playCueSound(strikePower * 0.7 + 0.3, strikePower * 0.5 + 0.8);
}

// В hitCueBallFromAngle():
if (cueHitSound) {
  playCueSound(0.8, 1.0);
}

  resetCurrentPlayerTimer();
}
  return false;
}

let showAimGuide = false;

function hitCueBallFromAngle() {
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

  // Воспроизведение звука удара
  if (cueHitSound) {
    cueHitSound.setVolume(0.8); // фиксированная громкость для клавиатурного удара
    cueHitSound.rate(1.0); // нормальная скорость
    cueHitSound.play();
  }
}