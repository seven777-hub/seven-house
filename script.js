const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== CONFIG =====
const SPEED = 2.5;
const BOOST_SPEED = 4.5;
const TURN_SPEED = 0.08;

const MAP_SIZE = 3000;

let safeRadius = MAP_SIZE / 2;
const MIN_SAFE = 200;
const SAFE_SPEED = 0.2;

let shrinking = true;

// ===== TIMER =====
let gameTime = 150;
let lastTime = Date.now();

// ===== PLAYER =====
let snake = [];
let maxLength = 30;

let head = { x: 0, y: 0, angle: 0 };
let target = { x: 0, y: 0 };

let boosting = false;

// ===== CAMERA =====
let cam = { x: 0, y: 0 };

// ===== FOODS =====
let foods = [];

for (let i = 0; i < 200; i++) {
  foods.push({
    x: (Math.random() - 0.5) * MAP_SIZE,
    y: (Math.random() - 0.5) * MAP_SIZE
  });
}

// ===== CONTROLES =====
document.addEventListener("touchstart", () => boosting = true);
document.addEventListener("touchend", () => boosting = false);

document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  target.x = t.clientX - canvas.width/2;
  target.y = t.clientY - canvas.height/2;
}, { passive: true });

document.addEventListener("mousemove", (e) => {
  target.x = e.clientX - canvas.width/2;
  target.y = e.clientY - canvas.height/2;
});

// ===== MORTE =====
function die() {
  snake.forEach(s => foods.push({ x: s.x, y: s.y }));

  snake = [];
  maxLength = 30;
  head.x = 0;
  head.y = 0;
}

// ===== UPDATE =====
function update() {

  // TIMER
  let now = Date.now();
  if (now - lastTime > 1000) {
    gameTime--;
    lastTime = now;
  }

  if (gameTime <= 30) shrinking = true;

  // SAFE
  if (shrinking && safeRadius > MIN_SAFE) safeRadius -= SAFE_SPEED;
  if (!shrinking && safeRadius < MAP_SIZE/2) safeRadius += SAFE_SPEED;
  if (safeRadius <= MIN_SAFE) shrinking = false;

  // DIREÇÃO
  let targetAngle = Math.atan2(target.y, target.x);
  let diff = targetAngle - head.angle;

  if (diff > Math.PI) diff -= Math.PI*2;
  if (diff < -Math.PI) diff += Math.PI*2;

  head.angle += diff * TURN_SPEED;

  // VERIFICA SE PODE BOOST
  let canBoost = maxLength > 20;

  let currentSpeed = (boosting && canBoost) ? BOOST_SPEED : SPEED;

  head.x += Math.cos(head.angle) * currentSpeed;
  head.y += Math.sin(head.angle) * currentSpeed;

  // BOOST CUSTO REAL
  if (boosting && canBoost) {
    maxLength -= 0.3;

    // solta comida
    if (Math.random() < 0.4) {
      let tail = snake[snake.length - 1];
      if (tail) foods.push({ x: tail.x, y: tail.y });
    }
  }

  // CORPO
  if (!snake[0] || Math.hypot(head.x - snake[0].x, head.y - snake[0].y) > 4) {
    snake.unshift({ x: head.x, y: head.y });
  }

  while (snake.length > maxLength) snake.pop();

  // COMER
  foods.forEach((food, i) => {
    if (Math.hypot(head.x - food.x, head.y - food.y) < 10) {
      foods.splice(i,1);
      maxLength += 4;

      foods.push({
        x: (Math.random()-0.5)*MAP_SIZE,
        y: (Math.random()-0.5)*MAP_SIZE
      });
    }
  });

  // ===== GÁS (CORRIGIDO) =====
  if (Math.hypot(head.x, head.y) > safeRadius) {

    // gás ignora boost → sempre perde forte
    maxLength -= 0.8;

    if (maxLength <= 10) {
      die();
      return;
    }
  }

  // COLISÃO
  for (let i = 20; i < snake.length; i++) {
    if (Math.hypot(head.x - snake[i].x, head.y - snake[i].y) < 8) {
      die();
      return;
    }
  }

  // CAMERA
  cam.x += (head.x - cam.x) * 0.1;
  cam.y += (head.y - cam.y) * 0.1;
}

// ===== DRAW =====
function draw() {

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  update();

  ctx.save();

  ctx.translate(
    canvas.width/2 - cam.x,
    canvas.height/2 - cam.y
  );

  // GRID
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  for (let x=-MAP_SIZE; x<=MAP_SIZE; x+=50){
    ctx.beginPath();
    ctx.moveTo(x,-MAP_SIZE);
    ctx.lineTo(x,MAP_SIZE);
    ctx.stroke();
  }
  for (let y=-MAP_SIZE; y<=MAP_SIZE; y+=50){
    ctx.beginPath();
    ctx.moveTo(-MAP_SIZE,y);
    ctx.lineTo(MAP_SIZE,y);
    ctx.stroke();
  }

  // SAFE
  ctx.beginPath();
  ctx.arc(0,0,safeRadius,0,Math.PI*2);
  ctx.strokeStyle = "rgba(0,255,150,0.2)";
  ctx.stroke();

  // FOODS
  foods.forEach(f=>{
    ctx.beginPath();
    ctx.arc(f.x,f.y,4,0,Math.PI*2);
    ctx.fillStyle="#ffd84d";
    ctx.fill();
  });

  // COBRA
  if (snake.length > 2) {

    ctx.beginPath();
    ctx.moveTo(snake[0].x, snake[0].y);

    for (let i=1;i<snake.length-2;i++){
      const xc=(snake[i].x+snake[i+1].x)/2;
      const yc=(snake[i].y+snake[i+1].y)/2;
      ctx.quadraticCurveTo(snake[i].x,snake[i].y,xc,yc);
    }

    let thickness = 6 + (maxLength/60);

    ctx.lineWidth = thickness+4;
    ctx.strokeStyle="#5fffd1";
    ctx.stroke();

    ctx.lineWidth = thickness;
    ctx.strokeStyle="#00c97a";
    ctx.stroke();

    // ===== PONTA ARDENDO =====
    if (boosting && maxLength > 20) {
      ctx.beginPath();
      ctx.arc(head.x, head.y, thickness + 6, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,120,0,0.5)";
      ctx.fill();
    }
  }

  ctx.restore();

  // ===== OLHOS CENTRALIZADOS =====
  const cx = canvas.width/2;
  const cy = canvas.height/2;

  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(cx-6, cy-4, 3,0,Math.PI*2);
  ctx.arc(cx+6, cy-4, 3,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="black";
  ctx.beginPath();
  ctx.arc(cx-6, cy-4, 1.5,0,Math.PI*2);
  ctx.arc(cx+6, cy-4, 1.5,0,Math.PI*2);
  ctx.fill();

  // UI
  ctx.fillStyle="white";
  ctx.font="16px Arial";

  let min = Math.floor(gameTime/60);
  let sec = gameTime%60;

  ctx.fillText(`Tempo: ${min}:${sec<10?"0":""}${sec}`, 20, 30);
  ctx.fillText(`Tamanho: ${Math.floor(maxLength)}`, 20, 55);

  requestAnimationFrame(draw);
}

draw();