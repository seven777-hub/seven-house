const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== CONFIG =====
const SPEED = 2.8;
const TURN_SPEED = 0.08;

const MAP_SIZE = 3000;
let safeRadius = MAP_SIZE / 2;
const SAFE_SPEED = 0.2;
const MIN_SAFE = 200;

// ===== PLAYER =====
let snake = [];
let maxLength = 30;

let head = {
  x: 0,
  y: 0,
  angle: 0
};

let target = { x: 0, y: 0 };

// ===== CAMERA =====
let cam = { x: 0, y: 0 };

// ===== COMIDA =====
let foods = [];

for (let i = 0; i < 200; i++) {
  foods.push({
    x: (Math.random() - 0.5) * MAP_SIZE,
    y: (Math.random() - 0.5) * MAP_SIZE
  });
}

// ===== CONTROLE =====
document.addEventListener("mousemove", (e) => {
  target.x = e.clientX - canvas.width / 2;
  target.y = e.clientY - canvas.height / 2;
});

document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  target.x = t.clientX - canvas.width / 2;
  target.y = t.clientY - canvas.height / 2;
}, { passive: true });

// ===== UPDATE =====
function update() {

  let targetAngle = Math.atan2(target.y, target.x);

  let diff = targetAngle - head.angle;

  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  head.angle += diff * TURN_SPEED;

  head.x += Math.cos(head.angle) * SPEED;
  head.y += Math.sin(head.angle) * SPEED;

  // corpo
  if (!snake[0] || Math.hypot(head.x - snake[0].x, head.y - snake[0].y) > 4) {
    snake.unshift({ x: head.x, y: head.y });
  }

  while (snake.length > maxLength) {
    snake.pop();
  }

  // COMER
  foods.forEach((food, i) => {
    const dx = head.x - food.x;
    const dy = head.y - food.y;

    if (Math.sqrt(dx*dx + dy*dy) < 10) {
      foods.splice(i, 1);
      maxLength += 4;

      foods.push({
        x: (Math.random() - 0.5) * MAP_SIZE,
        y: (Math.random() - 0.5) * MAP_SIZE
      });
    }
  });

  // ===== COLISÃO =====
  for (let i = 20; i < snake.length; i++) {
    const s = snake[i];

    if (Math.hypot(head.x - s.x, head.y - s.y) < 8) {
      snake = [];
      maxLength = 30;
      head.x = 0;
      head.y = 0;
      break;
    }
  }

  // ===== SAFE =====
  if (safeRadius > MIN_SAFE) {
    safeRadius -= SAFE_SPEED;
  }

  const dist = Math.hypot(head.x, head.y);

  if (dist > safeRadius) {
    maxLength -= 0.2;
    if (maxLength < 10) maxLength = 10;
  }

  // ===== CAMERA =====
  cam.x += (head.x - cam.x) * 0.1;
  cam.y += (head.y - cam.y) * 0.1;
}

// ===== DRAW =====
function draw() {

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  ctx.save();

  // câmera
  ctx.translate(
    canvas.width / 2 - cam.x,
    canvas.height / 2 - cam.y
  );

  // GRID
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  for (let x = -MAP_SIZE; x <= MAP_SIZE; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, -MAP_SIZE);
    ctx.lineTo(x, MAP_SIZE);
    ctx.stroke();
  }

  for (let y = -MAP_SIZE; y <= MAP_SIZE; y += 50) {
    ctx.beginPath();
    ctx.moveTo(-MAP_SIZE, y);
    ctx.lineTo(MAP_SIZE, y);
    ctx.stroke();
  }

  // SAFE ZONE
  ctx.beginPath();
  ctx.arc(0, 0, safeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = safeRadius < 300 ? "rgba(255,80,80,0.4)" : "rgba(0,255,150,0.2)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // COMIDA
  foods.forEach(food => {
    ctx.beginPath();
    ctx.arc(food.x, food.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd84d";
    ctx.fill();
  });

  // ===== COBRA =====
  if (snake.length > 2) {

    ctx.beginPath();
    ctx.moveTo(snake[0].x, snake[0].y);

    for (let i = 1; i < snake.length - 2; i++) {
      const xc = (snake[i].x + snake[i+1].x) / 2;
      const yc = (snake[i].y + snake[i+1].y) / 2;
      ctx.quadraticCurveTo(snake[i].x, snake[i].y, xc, yc);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let thickness = 6 + (maxLength / 60);

    ctx.lineWidth = thickness + 4;
    ctx.strokeStyle = "#5fffd1";
    ctx.stroke();

    ctx.lineWidth = thickness;
    ctx.strokeStyle = "#00c97a";
    ctx.stroke();
  }

  ctx.restore();

  // OLHOS (na tela)
  const screenX = canvas.width / 2;
  const screenY = canvas.height / 2;

  const ox = Math.cos(head.angle) * 4;
  const oy = Math.sin(head.angle) * 4;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(screenX - 6 + ox, screenY - 4 + oy, 3, 0, Math.PI * 2);
  ctx.arc(screenX + 6 + ox, screenY - 4 + oy, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(screenX - 6 + ox, screenY - 4 + oy, 1.5, 0, Math.PI * 2);
  ctx.arc(screenX + 6 + ox, screenY - 4 + oy, 1.5, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}

draw();