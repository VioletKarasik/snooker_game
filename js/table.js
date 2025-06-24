class Table {
  constructor(length, width) {
    this.length = length;
    this.width = width;

    // Позиция стола в центре холста
    this.x = width / 2;
    this.y = height / 2;

    // Создаём бортики (cushions)
    this.cushions = [];

    let cushionThickness = 30;

    // Прямоугольники бортиков вокруг стола
    // Верхний бортик
    this.cushions.push(this.createCushion((width / 2), (height - this.width) / 2 - cushionThickness/2, this.length, cushionThickness));
    // Нижний бортик
    this.cushions.push(this.createCushion((width / 2), (height + this.width) / 2 + cushionThickness/2, this.length, cushionThickness));
    // Левый бортик
    this.cushions.push(this.createCushion((width - this.length)/2 - cushionThickness/2, height/2, cushionThickness, this.width));
    // Правый бортик
    this.cushions.push(this.createCushion((width + this.length)/2 + cushionThickness/2, height/2, cushionThickness, this.width));
  }

  createCushion(x, y, w, h) {
    let body = Bodies.rectangle(x, y, w, h, { isStatic: true, restitution: 0.8, friction: 0.05, label: "cushion" });
    World.add(world, body);
    return body;
  }

  show() {
    // Заливка стола
    fill(10, 92, 39);
    rectMode(CENTER);
    rect(width / 2, height / 2, this.length, this.width);

    // Бортики
    fill(60, 30, 10);
    noStroke();
    for (let c of this.cushions) {
      push();
      translate(c.position.x, c.position.y);
      rotate(c.angle);
      rect(0, 0, c.bounds.max.x - c.bounds.min.x, c.bounds.max.y - c.bounds.min.y);
      pop();
    }

    // Рисуем "D" (полукруг для подачи)
    noFill();
    stroke(255);
    strokeWeight(2);
    let dRadius = this.width / 4;
    arc(width / 2 - this.length / 2 + dRadius, height / 2, dRadius * 2, dRadius * 2, -90, 90);
  }
}
