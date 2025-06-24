class Ball {
  constructor(x, y, color, label = "ball") {
    this.r = ballDiameter / 2;

    // Создаем физическое тело
    this.body = Matter.Bodies.circle(x, y, this.r, {
      restitution: 0.8,
      friction: 0.01,
      frictionAir: 0.01,
      label: label,
      isStatic: false
    });

    this.color = color;

    World.add(world, this.body);
  }

  draw() {
    const pos = this.body.position;

    push();
    noStroke();
    fill(this.color);
    ellipse(pos.x, pos.y, ballDiameter);
    pop();
  }

  // Проверка, попал ли мяч в лузу
  isInPocket(pockets) {
    const pos = this.body.position;
    return pockets.some(p => {
      const d = dist(pos.x, pos.y, p.x, p.y);
      return d < pocketDiameter / 2;
    });
  }

  // Удаление шара из физического мира
  remove() {
    World.remove(world, this.body);
  }
}
