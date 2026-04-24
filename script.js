const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== CONFIG =====
const SEGMENT_DISTANCE = 8;
const SMOOTH = 0.08;
const SAFE_RADIUS = 150;

// ===== PLAYER =====
let snake = [];
let maxLength = 30;

// cabeça começa no centro
let head = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// alvo
let target = {
  x: head.x,
  y: head.y
};

// comidas
let foods = [];

// ===== GERAR COMIDA =====
for (let i = 0; i < 50; i++) {
  foods.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  });
}

// ===== CONTROLES =====

// mouse
document.addEventListener("mousemove", (e) => {
  target.x = e.clientX;
  target.y = e.clientY;
});

// toque
document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  target.x = t.clientX;
  target.y = t.clientY;
});

// ===== UPDATE =====
function update() {
  // movimento suave
  head.x += (target.x - head.x) * SMOOTH;
  head.y += (target.y - head.y) * SMOOTH;

  // adiciona nova posição
  snake.unshift({ x: head.x, y: head.y });

  // limita tamanho
  while (snake.length > maxLength) {
    snake.pop();
  }

  // ===== COMER =====
  foods.forEach((food, index) => {
    const dx = head.x - food.x;
    const dy = head.y - food.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      foods.splice(index, 1);

      // crescimento proporcional
      maxLength += 5;

      // respawn comida
      foods.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      });
    }
  });
}

// ===== DESENHO =====
function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  // ===== SAFE ZONE =====
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, SAFE_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,255,0,0.3)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // ===== COMIDAS =====
  ctx.fillStyle = "yellow";
  foods.forEach(food => {
    ctx.beginPath();
    ctx.arc(food.x, food.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // ===== COBRA =====
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];

    ctx.beginPath();
    ctx.arc(segment.x, segment.y, 8, 0, Math.PI * 2);

    // cabeça verde, corpo degradê
    if (i === 0) {
      ctx.fillStyle = "lime";
    } else {
      ctx.fillStyle = "rgba(0,255,0,0.6)";
    }

    ctx.fill();
  }

  requestAnimationFrame(draw);
}

draw();