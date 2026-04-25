const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== CONFIG =====
const SMOOTH = 0.12;
const SAFE_RADIUS = 150;

let snake = [];
let maxLength = 30;

let head = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

let target = { x: head.x, y: head.y };

let foods = [];

// ===== CRIAR COMIDA =====
for (let i = 0; i < 100; i++) {
  foods.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  });
}

// ===== CONTROLES =====
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

  head.x += (target.x - head.x) * SMOOTH;
  head.y += (target.y - head.y) * SMOOTH;

  if (!snake[0] || Math.hypot(head.x - snake[0].x, head.y - snake[0].y) > 4) {
    snake.unshift({ x: head.x, y: head.y });
  }

  while (snake.length > maxLength) {
    snake.pop();
  }

  // COMER
  foods.forEach((food, index) => {
    const dx = head.x - food.x;
    const dy = head.y - food.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      foods.splice(index, 1);
      maxLength += 4;

      foods.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      });
    }
  });

  // GÁS
  const dx = head.x - canvas.width/2;
  const dy = head.y - canvas.height/2;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > SAFE_RADIUS) {
    maxLength -= 0.1;
    if (maxLength < 10) maxLength = 10;
  }

  // COLISÃO
  for (let i = 10; i < snake.length; i++) {
    const s = snake[i];
    const dx = head.x - s.x;
    const dy = head.y - s.y;

    if (Math.sqrt(dx*dx + dy*dy) < 7) {
      maxLength = 30;
      snake = [];
    }
  }
}

// ===== DESENHO =====
function draw() {

  // fundo com fade (efeito movimento)
  ctx.fillStyle = "rgba(10,10,10,0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  // GRID
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  ctx.lineWidth = 1;

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

  // SAFE ZONE
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, SAFE_RADIUS, 0, Math.PI*2);
  ctx.strokeStyle = "rgba(0,255,150,0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();

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

  // COBRA
  for (let i = snake.length - 1; i >= 0; i--) {
    const s = snake[i];

    let size = 8 - i * 0.02;
    if (size < 3.5) size = 3.5;

    // glow leve
    ctx.beginPath();
    ctx.arc(s.x, s.y, size + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,255,150,0.04)";
    ctx.fill();

    // corpo
    ctx.beginPath();
    ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
    ctx.fillStyle = "#00c97a";
    ctx.fill();
  }

  // DIREÇÃO DA CABEÇA
  const angle = Math.atan2(target.y - head.y, target.x - head.x);

  // OLHOS
  const eyeOffsetX = Math.cos(angle) * 3;
  const eyeOffsetY = Math.sin(angle) * 3;

  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.arc(head.x - 4 + eyeOffsetX, head.y - 3 + eyeOffsetY, 2.8, 0, Math.PI * 2);
  ctx.arc(head.x + 4 + eyeOffsetX, head.y - 3 + eyeOffsetY, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";

  ctx.beginPath();
  ctx.arc(head.x - 4 + eyeOffsetX, head.y - 3 + eyeOffsetY, 1.3, 0, Math.PI * 2);
  ctx.arc(head.x + 4 + eyeOffsetX, head.y - 3 + eyeOffsetY, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // GÁS VISUAL
  const dx = head.x - canvas.width/2;
  const dy = head.y - canvas.height/2;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > SAFE_RADIUS) {
    ctx.fillStyle = "rgba(0,255,120,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(draw);
}

draw();