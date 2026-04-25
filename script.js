const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== CONFIG =====
const SAFE_RADIUS = 150;
const SMOOTH = 0.12;

let snake = [];
let maxLength = 30;

let head = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

let target = { x: head.x, y: head.y };

let foods = [];
let boosting = false;

// ===== CRIAR COMIDA =====
for (let i = 0; i < 50; i++) {
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

document.addEventListener("touchstart", () => boosting = true);
document.addEventListener("touchend", () => boosting = false);

// ===== UPDATE =====
function update() {

  let speed = boosting ? 0.25 : SMOOTH;

  head.x += (target.x - head.x) * speed;
  head.y += (target.y - head.y) * speed;

  // OTIMIZAÇÃO (não criar ponto toda hora)
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

    if (dist < 12) {
      foods.splice(index, 1);
      maxLength += 6;

      foods.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      });
    }
  });

  // GÁS (fora da safe zone)
  const dx = head.x - canvas.width/2;
  const dy = head.y - canvas.height/2;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > SAFE_RADIUS) {
    maxLength -= 0.2;

    if (maxLength < 10) {
      maxLength = 10;
    }
  }

  // BOOST consome tamanho
  if (boosting) {
    maxLength -= 0.3;
  }

  // COLISÃO COM PRÓPRIO CORPO
  for (let i = 10; i < snake.length; i++) {
    const s = snake[i];
    const dx = head.x - s.x;
    const dy = head.y - s.y;

    if (Math.sqrt(dx*dx + dy*dy) < 8) {
      // morreu
      maxLength = 30;
      snake = [];
    }
  }
}

// ===== DESENHO =====
function draw() {

  ctx.fillStyle = "#0b0b0f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  // SAFE ZONE
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, SAFE_RADIUS, 0, Math.PI*2);
  ctx.strokeStyle = "rgba(0,255,150,0.3)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // COMIDA COM ANIMAÇÃO
  const time = Date.now() * 0.005;

  foods.forEach(food => {
    const pulse = Math.sin(time + food.x) * 2;

    ctx.beginPath();
    ctx.arc(food.x, food.y, 6 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = "#fff3a0";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(food.x, food.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffe066";
    ctx.fill();
  });

  // COBRA
  for (let i = snake.length - 1; i >= 0; i--) {
    const s = snake[i];

    let size = 10 - i * 0.03;
    if (size < 5) size = 5;

    // sombra
    ctx.beginPath();
    ctx.arc(s.x, s.y, size + 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // cor
    const g = ctx.createRadialGradient(
      s.x - 3, s.y - 3, 1,
      s.x, s.y, size
    );
    g.addColorStop(0, "#9effff");
    g.addColorStop(1, "#00c97a");

    ctx.beginPath();
    ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // OLHOS
  const h = snake[0];

  if (h) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(h.x - 4, h.y - 4, 3, 0, Math.PI * 2);
    ctx.arc(h.x + 4, h.y - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(h.x - 4, h.y - 4, 1.5, 0, Math.PI * 2);
    ctx.arc(h.x + 4, h.y - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // GÁS VISUAL
  const dx = head.x - canvas.width/2;
  const dy = head.y - canvas.height/2;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > SAFE_RADIUS) {
    ctx.fillStyle = "rgba(0,255,100,0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(draw);
}

draw();