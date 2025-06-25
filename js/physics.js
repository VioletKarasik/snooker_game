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
