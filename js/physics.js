// physics.js
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

let engine;
let world;

function setupPhysics() {
  engine = Engine.create();
  world = engine.world;

  Engine.run(engine);
}
