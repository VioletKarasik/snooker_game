class Ball {
  constructor(x, y, diameter, color, isCueBall = false) {
    this.diameter = diameter;
    this.radius = diameter / 2;
    this.color = color;
    this.isCueBall = isCueBall;

    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.9,
      friction: 0.02,
      frictionAir: 0.01,
      label: isCueBall ? 'cueBall' : 'ball'
    });
    World.add(world, this.body);
  }

  show() {
    let pos = this.body.position;
    let angle = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    noStroke();
    fill(this.color);
    ellipse(0, 0, this.diameter);
    pop();
  }

  isInPocket(pockets) {
    let pos = this.body.position;
    for (let p of pockets) {
      let d = dist(pos.x, pos.y, p.x, p.y);
      if (d < POCKET_DIAMETER / 2) return true;
    }
    return false;
  }
}
