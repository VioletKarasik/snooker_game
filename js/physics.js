// physics.js
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

let engine;
let world;

function setupPhysics() {
  engine = Engine.create();
  world = engine.world;

  // Отключаем гравитацию
  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0;

  Engine.run(engine);
}

let boundaries = [];

function setupBoundaries(tableX, tableY, tableWidth, tableHeight) {
  const thickness = 20; // толщина бортиков

  // Создаем 4 стены — верх, низ, левая, правая
  boundaries.push(
    Bodies.rectangle(tableX + tableWidth / 2, tableY - thickness / 2, tableWidth, thickness, { isStatic: true })
  );
  boundaries.push(
    Bodies.rectangle(tableX + tableWidth / 2, tableY + tableHeight + thickness / 2, tableWidth, thickness, { isStatic: true })
  );
  boundaries.push(
    Bodies.rectangle(tableX - thickness / 2, tableY + tableHeight / 2, thickness, tableHeight, { isStatic: true })
  );
  boundaries.push(
    Bodies.rectangle(tableX + tableWidth + thickness / 2, tableY + tableHeight / 2, thickness, tableHeight, { isStatic: true })
  );

  for (let b of boundaries) {
    World.add(world, b);
  }
}
