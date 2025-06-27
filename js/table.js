// Table dimensions and position variables
let tableWidth, tableHeight, tableX, tableY, pocketDiameter;

// Buffer for wood grain textures
let woodGrainBuffer = null;

/**
 * Initialize table dimensions based on canvas size
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 */
function setupTable(canvasWidth, canvasHeight) {
  tableWidth = canvasWidth * 0.9;
  tableHeight = tableWidth / 2; // Standard snooker table aspect ratio

  tableX = (canvasWidth - tableWidth) / 2; // Center horizontally
  tableY = 50; // Position from top

  pocketDiameter = tableWidth / 36 * 1.5; // Pocket size relative to table
}

/**
 * Draw the snooker table with all visual elements
 */
function drawTable() {
  noStroke();
  
  // Create texture buffers if they don't exist
  if (!woodGrainBuffer) {
    createWoodGrainBuffers();
  }
  
  // Draw wooden frame layers
  for (let i = 0; i < 20; i++) {
    let inter = map(i, 0, 19, 0.4, 0.7); // Interpolation for wood color
    fill(102 * inter, 51 * inter, 0); // Wood color gradient
    
    // Draw frame layer
    let x = tableX - 20 - i;
    let y = tableY - 20 - i;
    let w = tableWidth + 40 + i * 2;
    let h = tableHeight + 40 + i * 2;
    
    rect(x, y, w, h, 30); // Rounded corners

    // Apply wood grain textures to each side
    if (woodGrainBuffer.top) image(woodGrainBuffer.top, x, y, w, 40);
    if (woodGrainBuffer.bottom) image(woodGrainBuffer.bottom, x, y + h - 40, w, 40);
    if (woodGrainBuffer.left) image(woodGrainBuffer.left, x, y + 40, 40, h - 80);
    if (woodGrainBuffer.right) image(woodGrainBuffer.right, x + w - 40, y + 40, 40, h - 80);
  }

  // Draw table surface elements
  drawGreenBordersGradient();
  fill(30, 100, 30); // Table cloth color
  rect(tableX, tableY, tableWidth, tableHeight);
  drawTableDarkEdgesGradient();
  
  // Table outline
  noFill();
  stroke(0, 50);
  strokeWeight(1);
  rect(tableX, tableY, tableWidth, tableHeight, 12);
  
  // Draw table features
  drawPockets();
  drawTableMarkings();
}

/**
 * Create off-screen buffers for wood grain textures
 */
function createWoodGrainBuffers() {
  woodGrainBuffer = {
    top: createGraphics(tableWidth + 80, 40),
    bottom: createGraphics(tableWidth + 80, 40),
    left: createGraphics(40, tableHeight + 80),
    right: createGraphics(40, tableHeight + 80)
  };

  // Generate textures for each side
  drawWoodGrainTexture(woodGrainBuffer.top, true);
  drawWoodGrainTexture(woodGrainBuffer.bottom, true);
  drawWoodGrainTexture(woodGrainBuffer.left, false);
  drawWoodGrainTexture(woodGrainBuffer.right, false);
}

/**
 * Draw wood grain pattern in a buffer
 * @param {p5.Graphics} buffer - Graphics buffer to draw in
 * @param {boolean} horizontal - Orientation of the grain
 */
function drawWoodGrainTexture(buffer, horizontal) {
  buffer.push();
  buffer.noFill();
  buffer.stroke(45, 20, 0, 150); // Wood line color
  buffer.strokeWeight(1.5);

  const w = buffer.width;
  const h = buffer.height;
  const lineCount = horizontal ? 8 : 6; // Number of grain lines
  const spacing = horizontal ? h / lineCount : w / lineCount;
  const feather = 20; // Edge feathering
  const step = 10; // Point spacing

  // Draw wavy grain lines
  for (let i = 0; i < lineCount; i++) {
    buffer.beginShape();
    
    for (let j = 0; j <= (horizontal ? w : h); j += step) {
      let posX = horizontal ? j : i * spacing;
      let posY = horizontal ? i * spacing : j;

      // Create wood grain wave pattern
      let wave = 3 * sin(j / 15 + i / 2);

      // Feather edges
      let distToEdge = horizontal ? min(j, w - j) : min(j, h - j);
      let edgeFeather = distToEdge < feather ? distToEdge / feather : 1;
      wave *= edgeFeather;

      // Apply wave to position
      if (horizontal) posY += wave;
      else posX += wave;

      buffer.curveVertex(posX, posY);
    }
    buffer.endShape();
  }

  // Draw frame border
  buffer.noFill();
  buffer.stroke(45, 20, 0, 100);
  buffer.strokeWeight(2);
  buffer.rect(0, 0, w, h, 23);
  
  buffer.pop();
}

/**
 * Draw dark edge gradients on table surface
 */
function drawTableDarkEdgesGradient() {
  let ctx = drawingContext;
  let darkness = color(15, 50, 15, 100); // Dark green edge color
  let transparent = color(30, 100, 30, 0); // Transparent table color

  const fadeSize = 60; // Gradient fade distance

  push();
  noStroke();

  // Top edge gradient
  let topGrad = ctx.createLinearGradient(tableX, tableY, tableX, tableY + fadeSize);
  topGrad.addColorStop(0, darkness.toString());
  topGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = topGrad;
  ctx.fillRect(tableX, tableY, tableWidth, fadeSize);

  // Bottom edge gradient
  let bottomGrad = ctx.createLinearGradient(tableX, tableY + tableHeight, tableX, tableY + tableHeight - fadeSize);
  bottomGrad.addColorStop(0, darkness.toString());
  bottomGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(tableX, tableY + tableHeight - fadeSize, tableWidth, fadeSize);

  // Left edge gradient
  let leftGrad = ctx.createLinearGradient(tableX, tableY, tableX + fadeSize, tableY);
  leftGrad.addColorStop(0, darkness.toString());
  leftGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = leftGrad;
  ctx.fillRect(tableX, tableY, fadeSize, tableHeight);

  // Right edge gradient
  let rightGrad = ctx.createLinearGradient(tableX + tableWidth, tableY, tableX + tableWidth - fadeSize, tableY);
  rightGrad.addColorStop(0, darkness.toString());
  rightGrad.addColorStop(1, transparent.toString());
  ctx.fillStyle = rightGrad;
  ctx.fillRect(tableX + tableWidth - fadeSize, tableY, fadeSize, tableHeight);

  pop();
}

/**
 * Draw decorative borders around the table
 */
function drawGreenBordersGradient() {
  let mainColor = color(30, 100, 30);
  let darkColor = color(15, 70, 15);
  let lightColor = color(60, 140, 60);

  push();
  noStroke();
  let ctx = drawingContext;

  const borderWidth = 10;
  const offset = 10; // Inset from frame edge

  // Top highlight strip
  let topLightGrad = ctx.createLinearGradient(tableX - 20 + offset, tableY - 20 + offset, 
                                            tableX - 20 + offset, tableY - 20 + offset + borderWidth);
  topLightGrad.addColorStop(0, lightColor.toString());
  topLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = topLightGrad;
  ctx.fillRect(tableX - 20 + offset, tableY - 20 + offset, tableWidth + 40 - 2 * offset, borderWidth);

  // Bottom highlight strip
  let bottomLightGrad = ctx.createLinearGradient(tableX - 20 + offset, tableY + tableHeight + 20 - offset, 
                                               tableX - 20 + offset, tableY + tableHeight + 20 - offset - borderWidth);
  bottomLightGrad.addColorStop(0, lightColor.toString());
  bottomLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = bottomLightGrad;
  ctx.fillRect(tableX - 20 + offset, tableY + tableHeight + 20 - offset - borderWidth, tableWidth + 40 - 2 * offset, borderWidth);

  // Left highlight strip
  let leftLightGrad = ctx.createLinearGradient(tableX - 20 + offset, tableY - 20 + offset, 
                                             tableX - 20 + offset + borderWidth, tableY - 20 + offset);
  leftLightGrad.addColorStop(0, lightColor.toString());
  leftLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = leftLightGrad;
  ctx.fillRect(tableX - 20 + offset, tableY - 20 + offset, borderWidth, tableHeight + 40 - 2 * offset);

  // Right highlight strip
  let rightLightGrad = ctx.createLinearGradient(tableX + tableWidth + 20 - offset, tableY - 20 + offset, 
                                              tableX + tableWidth + 20 - offset - borderWidth, tableY - 20 + offset);
  rightLightGrad.addColorStop(0, lightColor.toString());
  rightLightGrad.addColorStop(1, mainColor.toString());
  ctx.fillStyle = rightLightGrad;
  ctx.fillRect(tableX + tableWidth + 20 - offset - borderWidth, tableY - 20 + offset, borderWidth, tableHeight + 40 - 2 * offset);

  pop();
}

/**
 * Draw the table pockets (holes)
 */
function drawPockets() {
  let pockets = getPocketPositions();
  for (let p of pockets) {
    let shadowOffsetX = 0;
    let shadowOffsetY = 0;

    // Determine shadow direction based on pocket position
    if (p.x < tableX + tableWidth / 2) shadowOffsetX = 2;
    else if (p.x > tableX + tableWidth / 2) shadowOffsetX = -2;

    if (p.y < tableY + tableHeight / 2) shadowOffsetY = 2;
    else if (p.y > tableY + tableHeight / 2) shadowOffsetY = -2;

    // Draw shadow
    fill(0, 100);
    ellipse(p.x + shadowOffsetX, p.y + shadowOffsetY, pocketDiameter * 1.05);

    // Draw pocket
    fill(0);
    ellipse(p.x, p.y, pocketDiameter);
  }
}

/**
 * Draw table markings (D-area and baulk line)
 */
function drawTableMarkings() {
  // Draw D-area semicircle
  let dRadius = tableWidth * 0.10;
  let dCenterX = tableX + tableWidth * 0.25;
  let dCenterY = tableY + tableHeight / 2;

  noFill();
  stroke(255, 200); // White chalk line
  strokeWeight(1.5);
  arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, HALF_PI, -HALF_PI);

  // Draw baulk line
  let dLineX = dCenterX + dRadius - 108;
  line(dLineX, tableY, dLineX, tableY + tableHeight);
}

/**
 * Create physics boundaries for table edges
 */
function setupTableBorders(tableX, tableY, tableWidth, tableHeight) {
  const thickness = 50; // Physics wall thickness
  const borders = [
    Matter.Bodies.rectangle(tableX + tableWidth / 2, tableY - thickness / 2, tableWidth, thickness, { isStatic: true }),
    Matter.Bodies.rectangle(tableX + tableWidth / 2, tableY + tableHeight + thickness / 2, tableWidth, thickness, { isStatic: true }),
    Matter.Bodies.rectangle(tableX - thickness / 2, tableY + tableHeight / 2, thickness, tableHeight, { isStatic: true }),
    Matter.Bodies.rectangle(tableX + tableWidth + thickness / 2, tableY + tableHeight / 2, thickness, tableHeight, { isStatic: true })
  ];
  for (let wall of borders) Matter.World.add(engine.world, wall);
}

/**
 * Get positions of all table pockets
 * @returns {Array} Array of pocket positions
 */
function getPocketPositions() {
  return [
    { x: tableX, y: tableY }, // Top-left
    { x: tableX + tableWidth / 2, y: tableY }, // Top-middle
    { x: tableX + tableWidth, y: tableY }, // Top-right
    { x: tableX, y: tableY + tableHeight }, // Bottom-left
    { x: tableX + tableWidth / 2, y: tableY + tableHeight }, // Bottom-middle
    { x: tableX + tableWidth, y: tableY + tableHeight }, // Bottom-right
  ];
}

/**
 * Check if coordinates are near the table
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} margin - Detection margin
 * @returns {boolean} True if near table
 */
function isNearTable(x, y, margin = 50) {
  return x >= tableX - margin && 
         x <= tableX + tableWidth + margin &&
         y >= tableY - margin && 
         y <= tableY + tableHeight + margin;
}