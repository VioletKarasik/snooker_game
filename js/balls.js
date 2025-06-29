let balls = [];
let ballDiameter;
let cueBallPlaced = false;
let lastCollisions = {};
let penaltyText = ""; // Text for penalty display (e.g. "-1")
let penaltyAlpha = 0; // Transparency of penalty text (0..255)
let penaltyTimer = 0; // Timer for how long penalty is shown
let gameOver = false;
let allRedsCleared = false;
const penaltyDuration = 60; // Duration for showing penalty text (frames, 60 ≈ 1 second)
let winMessageText = null;
let lastPottedType = null; // 'red' or 'colour'
let consecutiveColourPottingWarningShown = false;
let warningMessageText = "";
let warningMessageTimer = 0;

// Ball colors
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

// Score values for each ball
const BALL_SCORES = {
    red: 1,
    yellow: 2,
    green: 3,
    brown: 4,
    blue: 5,
    pink: 6,
    black: 7
};

// Ball class for physics and rendering
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
    // Reset ball to its original position
    resetPosition() {
        Matter.Body.setPosition(this.body, {
            x: this.originalX,
            y: this.originalY
        });
        Matter.Body.setVelocity(this.body, {
            x: 0,
            y: 0
        });
        Matter.Body.setAngularVelocity(this.body, 0);
        Matter.Body.setAngle(this.body, 0);
    }
    // Render the ball
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

// Set up collision detection for cue ball
function setupCollisionDetection() {
    Matter.Events.on(engine, 'collisionStart', function(event) {
        const pairs = event.pairs;

        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];

            // Check if the cue ball is involved in the collision
            const cueBallInvolved =
                (pair.bodyA.label === 'ball' && pair.bodyA.color === COLORS.cue) ||
                (pair.bodyB.label === 'ball' && pair.bodyB.color === COLORS.cue);

            if (!cueBallInvolved) continue;

            // Determine the type of collision
            let cueBody, otherBody;
            if (pair.bodyA.color === COLORS.cue) {
                cueBody = pair.bodyA;
                otherBody = pair.bodyB;
            } else {
                cueBody = pair.bodyB;
                otherBody = pair.bodyA;
            }

            // Type of collision
            let collisionType;

            if (otherBody.label === 'ball') {
                // With another ball
                if (otherBody.color === COLORS.red) {
                    collisionType = 'cue-red';
                } else {
                    collisionType = 'cue-color';
                }
            } else {
                // With cushion
                collisionType = 'cue-cushion';
            }

            // Avoid duplicate collision messages
            const collisionKey = `${cueBody.id}-${otherBody.id}`;
            if (!lastCollisions[collisionKey] || Date.now() - lastCollisions[collisionKey] > 500) {
                showCollisionMessage(collisionType);
                lastCollisions[collisionKey] = Date.now();
            }
        }
    });
}

// Display collision messages
function showCollisionMessage(type) {
    let message = '';

    switch (type) {
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

    console.log(message);

    const messageElement = document.getElementById('collision-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 2000);
    }
}

// Remove all balls from the table
function clearAllBalls() {
    for (let ball of balls) {
        Matter.World.remove(engine.world, ball.body);
    }
    balls = [];
}

// Set up all balls on the table
function setupBalls(tableX, tableY, tableWidth, tableHeight) {
    ballDiameter = tableWidth / 36;
    clearAllBalls();

    const rackX = tableX + tableWidth * 0.75;
    const rackY = tableY + tableHeight / 2 - ((Math.sqrt(3) / 2) * ballDiameter * 2);
    setupRedBalls(rackX, rackY);

    setupColoredBalls(tableX, tableY, tableWidth, tableHeight);
}

// Check if a position is within the D zone
function isInDZone(x, y) {
    let dRadius = tableWidth * 0.10;
    let dCenterX = tableX + tableWidth * 0.25;
    let dCenterY = tableY + tableHeight / 2;

    let dx = x - dCenterX;
    let dy = y - dCenterY;

    if (dx <= 0 && dx * dx + dy * dy <= dRadius * dRadius) {
        return true;
    }
    return false;
}

// Arrange red balls in triangle rack
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

// Place colored balls in their designated positions
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

// Check if a ball overlaps any existing one
function isOverlapping(x, y, radius) {
    for (let ball of balls) {
        const dx = ball.body.position.x - x;
        const dy = ball.body.position.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (ball.diameter / 2 + radius)) return true;
    }
    return false;
}

// Place 15 red balls randomly
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

// Place all balls randomly
function setupRandomAllBalls() {
    clearAllBalls();
    ballDiameter = tableWidth / 36;

    let attempts = 0;
    // Red
    while (balls.length < 15 && attempts < 1000) {
        let x = random(tableX + ballDiameter, tableX + tableWidth - ballDiameter);
        let y = random(tableY + ballDiameter, tableY + tableHeight - ballDiameter);
        if (!isOverlapping(x, y, ballDiameter / 2)) {
            balls.push(new Ball(x, y, ballDiameter, COLORS.red));
        }
        attempts++;
    }

    // Colored
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

// Place cue ball when mouse is pressed
function mousePressed() {
    if (!cueBallPlaced) {
        // Draw cue ball where clicked
        cueBall = new Ball(mouseX, mouseY, ballDiameter, COLORS.cue);
        balls.push(cueBall);
        cueBallPlaced = true;
    }
}

// Draw all balls
function drawBalls() {
    for (let ball of balls) {
        ball.show();
    }
}

// Check if any ball is still moving
function ballsMoving() {
    const velocityThreshold = 0.1;
    const angularThreshold = 0.02;

    for (let ball of balls) {
        const v = ball.body.velocity;
        const av = ball.body.angularVelocity;

        if (Math.abs(v.x) > velocityThreshold ||
            Math.abs(v.y) > velocityThreshold ||
            Math.abs(av) > angularThreshold) {
            allowStrike = false;
            return true;
        }
    }

    allowStrike = true;
    return false;
}

// Reset all balls to original positions
function resetAllBalls() {
    if (ballsMoving()) return;
    for (let ball of balls) {
        ball.resetPosition();
    }
}

// Check if a ball is in a pocket
function checkBallInPocket(ball) {
    const pockets = getPocketPositions();
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

// Check if cue ball was potted
function checkCueBallPotted() {
    if (!cueBall) return;

    if (checkBallInPocket(cueBall)) {
        Matter.World.remove(engine.world, cueBall.body);

        balls = balls.filter(ball => ball !== cueBall);

        cueBall = null;
        cueBallPlaced = false;

        console.log("Cue ball potted. Place it again in the D zone.");

        applyPenalty();
    }
}

// Apply penalty for fouls
function applyPenalty() {
    if (isTwoPlayerMode) {
        scores[currentPlayer] = Math.max(0, scores[currentPlayer] - 1);

        score = Math.max(0, score - 1);

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

// Draw the penalty text on screen
function drawPenalty() {
    if (penaltyTimer > 0) {
        penaltyTimer--;

        penaltyAlpha = map(penaltyTimer, 0, penaltyDuration, 0, 255);

        push();
        textAlign(CENTER, CENTER);
        textSize(48);
        textFont('Tahoma');
        fill(255, 0, 0, penaltyAlpha);
        stroke(255, 0, 0, penaltyAlpha);
        strokeWeight(2);
        text(penaltyText, width / 2, height / 2);
        pop();
    }
}

// Add score when a ball is potted
function addScoreForBall(color) {
    if (color === COLORS.cue) return;

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
        score += points;
        document.getElementById(`current${currentPlayer}`).textContent = score;
    } else {
        score += points;
        updateScoreDisplay();
    }
}

// Check for potted colored or red balls
function checkColoredBallsPotted() {
    for (let ball of [...balls]) {
        if (ball.color === COLORS.cue) continue;

        if (checkBallInPocket(ball)) {
            Matter.World.remove(engine.world, ball.body);
            balls = balls.filter(b => b !== ball);

            // Check: two colored balls in a row
            let ballType = (ball.color === COLORS.red) ? "red" : "colour";

            if (ballType === "colour" && lastPottedType === "colour") {
                if (!consecutiveColourPottingWarningShown) {
                    showTwoColorsInPocketMessage();
                    consecutiveColourPottingWarningShown = true;
                }
            } else {
                consecutiveColourPottingWarningShown = false;
            }

            lastPottedType = ballType;

            // === Начисление очков ===
            addScoreForBall(ball.color);

            if (ball.color === COLORS.red) {
                console.log(`Red ball potted and removed.`);

                const redsLeft = balls.some(b => b.color === COLORS.red);
                if (!redsLeft) {
                    allRedsCleared = true;
                    console.log("All reds cleared! Now color balls can be removed.");
                }

            } else {
                if (!allRedsCleared) {
                    let respottedBall = new Ball(ball.originalX, ball.originalY, ballDiameter, ball.color);
                    balls.push(respottedBall);
                    console.log(`Colored ball (${ball.color}) potted and re-spotted.`);
                } else {
                    console.log(`Colored ball (${ball.color}) potted and removed.`);
                }
            }
        }
    }

    if (balls.length === 1 && balls[0].color === COLORS.cue) {
        showWinMessage();
    }
}

function showTwoColorsInPocketMessage() {
    const msg = "⚠️ Invalid shot: Two coloured balls potted in a row!";
    const msgDiv = document.getElementById("message");

    if (msgDiv) {
        msgDiv.innerText = msg;
        msgDiv.style.opacity = 1;
        setTimeout(() => {
            msgDiv.style.opacity = 0;
        }, 3000);
    }

    console.warn(msg);

    // Write to a global variable and enable a timer for display on canvas
    warningMessageText = msg;
    warningMessageTimer = 180; // show 180 frames (~3 seconds at 60 FPS)
}

// Show win message if all balls are collected
function showWinMessage() {
    if (!gameOver) {
        gameOver = true;
        playWinSound();

        if (isTwoPlayerMode) {
            let finalScore1 = scores[0] + (currentPlayer === 1 ? score : 0);
            let finalScore2 = scores[1] + (currentPlayer === 2 ? score : 0);

            if (finalScore1 > finalScore2) {
                winMessageText = "Player 1 wins! 🏆";
            } else if (finalScore2 > finalScore1) {
                winMessageText = "Player 2 wins! 🎯";
            } else {
                winMessageText = "It's a tie! 🤝";
            }

            winMessageText += `\nFinal Score - P1: ${finalScore1} | P2: ${finalScore2}`;
        } else {
            winMessageText = "Congratulations! You cleared the table!";
        }
    }
}