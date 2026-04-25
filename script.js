const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== CONFIG =====
const SPEED = 2.2;
const TURN_SPEED = 0.08;

let snake = [];
let maxLength = 30;

let head = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0
};

let target = { x: head.x, y: head.y };

// ===== TEXTURA =====
const texCanvas = document.createElement("canvas");
texCanvas.width = 40;
texCanvas.height = 40;
const tctx = texCanvas.getContext("2d");

tctx.fillStyle = "#00c97a";
tctx.fillRect(0, 0, 40, 40);

tctx.strokeStyle = "#6affd2";
tctx.lineWidth = 6;
tctx.beginPath();
tctx.moveTo(0, 40);
tctx.lineTo(40, 0);
tctx.stroke();

let textureOffset = 0;

// ===== COMIDA =====
let foods = [];
for (let i = 0; i < 80; i++) {
  foods.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  });
}

// ===== CONTROLE =====
document.addEventListener("mousemove", (e) => {
  target.x = e.clientX;
  target.y = e.clientY;
});

document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  target.x = t.clientX;
  target.y = t.clientY;
}, { passive: true });

// ===== UPDATE =====
function update() {

  // direção alvo
  let targetAngle = Math.atan2(target.y - head.y, target.x - head.x);

  // suavizar rotação
  let diff = targetAngle - head.angle;

  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  head.angle += diff * TURN_SPEED;

  // movimento constante
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
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      });
    }
  });

  // ===== COLISÃO COM CORPO =====
  for (let i = 15; i < snake.length; i++) {
    const s = snake[i];

    const dx = head.x - s.x;
    const dy = head.y - s.y;

    if (Math.sqrt(dx*dx + dy*dy) < 8) {
      // reset
      snake = [];
      maxLength = 30;
      head.x = canvas.width / 2;
      head.y = canvas.height / 2;
      break;
    }
  }

  textureOffset += 2;
}

// ===== DESENHO =====
function draw() {

  ctx.fillStyle = "rgba(10,10,10,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  // GRID
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // COMIDA
  const time = Date.now() * 0.004;

  foods.forEach(food => {
    const pulse = Math.sin(time + food.x) * 1.5;

    ctx.beginPath();
    ctx.arc(food.x, food.y, 6 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,230,120,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(food.x, food.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd84d";
    ctx.fill();
  });

  // ===== COBRA =====
  if (snake.length > 2) {

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(snake[0].x, snake[0].y);

    for (let i = 1; i < snake.length - 2; i++) {
      const xc = (snake[i].x + snake[i+1].x) / 2;
      const yc = (snake[i].y + snake[i+1].y) / 2;
      ctx.quadraticCurveTo(snake[i].x, snake[i].y, xc, yc);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let thickness = 8 + (maxLength / 50);

    // borda
    ctx.lineWidth = thickness + 6;
    ctx.strokeStyle = "#6affd2";
    ctx.stroke();

    // textura
    ctx.clip();

    ctx.translate(-textureOffset, 0);
    const pattern = ctx.createPattern(texCanvas, "repeat");
    ctx.fillStyle = pattern;

    ctx.fillRect(0, 0, canvas.width * 2, canvas.height * 2);

    ctx.restore();
  }

  // ===== OLHOS DIRECIONAIS =====
  const ox = Math.cos(head.angle) * 4;
  const oy = Math.sin(head.angle) * 4;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(head.x - 5 + ox, head.y - 3 + oy, 3, 0, Math.PI * 2);
  ctx.arc(head.x + 5 + ox, head.y - 3 + oy, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(head.x - 5 + ox, head.y - 3 + oy, 1.5, 0, Math.PI * 2);
  ctx.arc(head.x + 5 + ox, head.y - 3 + oy, 1.5, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}

draw();
