const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// CONFIG
const SMOOTH = 0.12;

let MAP_RADIUS = Math.max(canvas.width, canvas.height);
let safeRadius = MAP_RADIUS;
const MIN_SAFE = 100;
const SAFE_SPEED = 0.08;

let snake = [];
let maxLength = 80;

let head = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

let target = { x: head.x, y: head.y };

let foods = [];

// ===== TEXTURA DINÂMICA =====
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

// COMIDA
for (let i = 0; i < 120; i++) {
  foods.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  });
}

// CONTROLES
document.addEventListener("mousemove", (e) => {
  target.x = e.clientX;
  target.y = e.clientY;
});

document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  target.x = t.clientX;
  target.y = t.clientY;
}, { passive: true });

// UPDATE
function update() {

  head.x += (target.x - head.x) * SMOOTH;
  head.y += (target.y - head.y) * SMOOTH;

  if (!snake[0] || Math.hypot(head.x - snake[0].x, head.y - snake[0].y) > 5) {
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
      maxLength += 5;

      foods.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      });
    }
  });

  // SAFE DIMINUINDO
  if (safeRadius > MIN_SAFE) {
    safeRadius -= SAFE_SPEED;
  }

  // GÁS
  const dx = head.x - canvas.width/2;
  const dy = head.y - canvas.height/2;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > safeRadius) {
    maxLength -= 0.15;
    if (maxLength < 15) maxLength = 15;
  }

  // mover textura
  textureOffset += 2;
}

// DESENHO
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

  // SAFE
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, safeRadius, 0, Math.PI*2);
  ctx.strokeStyle = safeRadius < 150 ? "rgba(255,80,80,0.4)" : "rgba(0,255,150,0.15)";
  ctx.stroke();

  // COMIDA
  const time = Date.now() * 0.004;

  foods.forEach(food => {
    const pulse = Math.sin(time + food.x) * 1.5;

    ctx.beginPath();
    ctx.arc(food.x, food.y, 7 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,230,120,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(food.x, food.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd84d";
    ctx.fill();
  });

  // ===== COBRA COM TEXTURA ANIMADA =====
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

    // BORDA
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#6affd2";
    ctx.stroke();

    // CLIP PARA TEXTURA
    ctx.clip();

    // mover padrão
    ctx.translate(-textureOffset, 0);

    const pattern = ctx.createPattern(texCanvas, "repeat");
    ctx.fillStyle = pattern;

    ctx.fillRect(0, 0, canvas.width * 2, canvas.height * 2);

    ctx.restore();
  }

  // DIREÇÃO
  const angle = Math.atan2(target.y - head.y, target.x - head.x);
  const ox = Math.cos(angle) * 4;
  const oy = Math.sin(angle) * 4;

  // OLHOS
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