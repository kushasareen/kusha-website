// To Do:
//   - collision

function setup() {
  textFont('Ubuntu');
  paused = true;
  windowW = 1080;
  windowH = 600;
  createCanvas(windowW, windowH);
  noStroke();
  ball = createVector(windowW/2, windowH/2);
  paddleW = 30;
  paddleH = 120;
  p2Y = (windowH- paddleH)/2;
  maxSpeed = 250;
  easing = 0.1;
  p1Y = p2Y;
  ballR = 20;
  ballSpeed = createVector(random(-8, 8), random(-8, 8));
  p1X = paddleW+20;
  p2X = windowW - paddleW*2-20;
  p2Difficulty = 1.5;
  p1Score = 0;
  p2Score = 0;
  p1Gamma = 1;
  p2Gamma = 1;
  particleR = 15;
  particle = createVector(300, 400);
  Gmm = 10;
  
  Gm = 20;
  clockSpeed = 0.01;
  playerTheta = 0;
  ballTheta = 0;
  masterTheta = 0;
  
  button = createButton('Play/Pause');
  button.position(0, windowH - 30);
  button.mousePressed(changeBG);
  
  sliderG = createSlider(0, 50, 10);
  sliderG.position(100, windowH - 30);
  
  sliderC = createSlider(200, 400, 250);
  sliderC.position(270, windowH - 30);
  particles = [particle];
}

function draw() {
  background(240, 240, 240);
  setSliders();
  
  
  if (!paused){
    renderClocks();
    applyAccel();
    updatePositions();
    checkCollision();
    renderObjects();
  } else {
    drawClocks();
    renderObjects();
  }
}

function drawClocks() {
  textSize(14);
  fill(0);
  text('Player',80,70);
  text('Ball',190,70);
  text('Observer',270,70);
  
  drawClock(100, 30, 40);
  drawClock(200, 30, 40);
  drawClock(300, 30, 40);
  stroke(0);
  strokeWeight(2);
  CLX = 100+20*Math.sin(-playerTheta);
  CLY = 30+20*Math.cos(-playerTheta);
  CLX1 = 200+20*Math.sin(-ballTheta);
  CLY1 = 30+20*Math.cos(-ballTheta);
  CLX2 = 300+20*Math.sin(-masterTheta);
  CLY2 = 30+20*Math.cos(-masterTheta);
  line(100, 30, CLX, CLY);
  line(200, 30, CLX1, CLY1);
  line(300, 30, CLX2, CLY2);
  strokeWeight(0);
}

function renderClocks() {
  
  particles.forEach(particle => {
    n = p5.Vector.sub(particle,ball);
    r = n.mag();
    if ((200000*Gm)/(r*(maxSpeed**2)) < 1) {
      GRtime = sqrt(1-(200000*Gm)/(r*(maxSpeed**2)));
    }
    ballGamma = sqrt(1 - (ballSpeed.mag()**2 / maxSpeed**2));
    p1Speed = abs(p1Y - pmouseY);
    playerGamma = 1;
    if ((p1Speed**2 / maxSpeed**2) < 1) {
      playerGamma = sqrt(1 - (p1Speed**2 / maxSpeed**2));
    }
    playerTheta += (clockSpeed*playerGamma);
    ballTheta += (clockSpeed*ballGamma*GRtime);
    masterTheta += clockSpeed;
  });
  
  drawClocks();
  
}

function drawClock(x, y, d) {
  fill(240);
  stroke(0);
  strokeWeight(2);
  ellipse(x, y, d, d);
  line(x + d*9/20, y, x+d/3, y);
  line(x - d*9/20, y, x-d/3, y);
  line(x, y - d*9/20, x, y-d/3);
  line(x, y + d*9/20, x, y+d/3);

  noStroke();
}


function setSliders() {
  Gmm = sliderG.value();
  maxSpeed = sliderC.value();
}

function resetClocks() {
  playerTheta = 0;
  ballTheta = 0;
  masterTheta = 0;
}

function mouseClicked() {
  if (mouseX > 60 && mouseX < windowW - 60 && mouseY > 60 && mouseY < windowH - 60){
    particles.push(createVector(mouseX, mouseY))
  }
}

function changeBG() {
  paused = !paused;
}

function applyAccel() {
  particles.forEach(particle => {
    n = p5.Vector.sub(particle,ball);
    r = n.mag();
    v = ballSpeed.mag();
    rel_correction = p5.Vector.mult(p5.Vector.add(p5.Vector.mult(n, v**2), p5.Vector.mult(ballSpeed,4*p5.Vector.dot(n,ballSpeed))),Gmm/(maxSpeed**2*r**3));
    a = p5.Vector.add(p5.Vector.mult(n, Gmm / r**2), rel_correction);
    ballSpeed.add(a);
    });
}

function renderObjects() {
  fill(0);
  textSize(14);
  text("Gravitational constant", 100, windowH - 40);
  text("Light speed", 270, windowH - 40);
  
  textSize(32);
  text(String(p1Score + ' - ' + p2Score), windowW / 2, 30);

  rect(p1X, p1Y - paddleH*p1Gamma/2, paddleW, paddleH*p1Gamma, 20);
  rect(p2X, p2Y - paddleH*p2Gamma/2, paddleW, paddleH*p2Gamma, 20);
  ellipse(ball.x, ball.y, ballR, ballR);
  
  fill(126, 173, 247);
  particles.forEach(particle => {
    ellipse(particle.x, particle.y, particleR, particleR);
  });
}

function updatePositions() {
  p1Speed  = abs(p1Y - pmouseY);
  p1Gamma = sqrt(1 - (p1Speed / maxSpeed)**2);
  
  p2Speed = abs(p2Y - ball.y);
  p2Gamma = sqrt(1 - (p2Speed / maxSpeed)**2);
                
  p1DY = mouseY - p1Y;
  p1Y += p1DY * easing;
  
  p2DY = ball.y - p2Y;
  p2Y += p2DY * easing*p2Difficulty;
  ball.y += ballSpeed.y;
  ball.x += ballSpeed.x;
}

function checkRectangle(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
  return (r1x < r2x + r2w &&
    r1x + r1w > r2x &&
    r1y < r2y + r2h &&
    r1y + r1h > r2y);
}

function checkCollision() {
    if (ball.y < 0 || ball.y > windowH) {
      ballSpeed.y *= -1;
  }
  
  if ((ball.x < p1X + paddleW) && (ball.x > p1X) && (ball.y > p1Y - paddleH*p1Gamma/2) && (ball.y < p1Y + paddleH*p1Gamma/2)) {
      ballSpeed.x *= -1;
  }
  
  if ((ball.x + ballR > p2X) && (ball.x < p2X) && (ball.y > p2Y - paddleH*p2Gamma/2) && (ball.y < p2Y + paddleH*p2Gamma/2)) {
      ballSpeed.x *= -1;
  }
  
  // if (checkRectangle(p1X, p1Y - paddleH*p1Gamma/2, paddleW, paddleH*p1Gamma, ball.x, ball.y, ballR, ballR) || checkRectangle(p2X, p2Y - paddleH*p2Gamma/2, paddleW, paddleH*p2Gamma, ball.x, ball.y, ballR, ballR)) {
  //   console.log("Hi")
  //   ballSpeed.x *= 1;
  // }
  
  
  if (ball.x <= 0) {
    ball.y = windowH/2;
    ball.x = windowW/2;
    ballSpeed = createVector(random(-8, 8), random(-8, 8));
    resetClocks();
    p2Score += 1;
  }
  
  if (ball.x + ballR >= windowW){
    ball.y = windowH/2;
    ball.x = windowW/2;
    ballSpeed = createVector(random(-8, 8), random(-8, 8));
    resetClocks();

    p1Score += 1;
  }
  
}