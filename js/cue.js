class Cue {
  constructor() {
    this.angle = 0;
    this.power = 0;
    this.maxPower = 15;
    this.hitting = false;
  }

  update() {
    // Подстройка угла кия по положению мыши относительно шарика
    if (balls.length === 0) return;
    let cueBall = balls.find(b => b.isCueBall);
    if (!cueBall) return;

    let pos = cueBall.body.position;
    this.angle = degrees(atan2(mouseY - pos.y, mouseX - pos.x));
  }

  show() {
    if (balls.length === 0) return;
    let cueBall = balls.find(b => b.isCueBall);
    if (!cueBall) return;

    let pos = cueBall.body.position;

    push();
    translate(pos.x, pos.y);
    rotate(this.angle);
    stroke(139, 69, 19);
    strokeWeight(6);
    line(0, 0, -this.power * 20, 0);
    pop();
  }

  hit() {
    if (balls.length === 0) return;
    let cueBall = balls.find(b => b.isCueBall);
    if (!cueBall) return;

    // Сила удара в направлении кия
    let forceMagnitude = map(this.power, 0, this.maxPower, 0, 0.05);
    let force = Matter.Vector.create(cos(radians(this.angle)) * forceMagnitude, sin(radians(this.angle)) * forceMagnitude);
    Body.applyForce(cueBall.body, cueBall.body.position, force);

    this.power = 0;
  }
}
