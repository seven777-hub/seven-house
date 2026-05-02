const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// SOCKET
const socket = io();
let otherPlayers = {};

// CONFIG
const SPEED = 2.2;
const BOOST_SPEED = 4.0;
const TURN_SPEED = 0.08;

let snake = [];
let maxLength = 40;

let head = { x: 0, y: 0, angle: 0 };
let target = { x: 0, y: 0 };

let boosting = false;
let lastTap = 0;

let cam = { x: 0, y: 0 };

// CONTROLES MOBILE
document.addEventListener("touchstart", () => {
  let now = Date.now();
  if (now - lastTap < 250) boosting = true;
  lastTap = now;
});

document.addEventListener("touchend", () => boosting = false);

document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  target.x = t.clientX - canvas.width / 2;
  target.y = t.clientY - canvas.height / 2;
}, { passive: true });

// CONTROLES PC
document.addEventListener("mousemove", (e) => {
  target.x = e.clientX - canvas.width / 2;
  target.y = e.clientY - canvas.height / 2;
});

// SOCKET INIT
socket.on("init", (data) => {
  otherPlayers = data;

  if (data[socket.id]) {
    head.x = data[socket.id].x;
    head.y = data[socket.id].y;
    maxLength = data[socket.id].size || 40;

    snake = [];
    for (let i = 0; i < maxLength; i++) {
      snake.push({ x: head.x, y: head.y });
    }
  }
});

// SOCKET UPDATE GLOBAL
socket.on("state", (data) => {
  otherPlayers = data;
});

// UPDATE
function update() {

  let targetAngle = Math.atan2(target.y, target.x);
  let diff = targetAngle - head.angle;

  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  head.angle += diff * TURN_SPEED;

  let canBoost = maxLength > 25;
  let speed = (boosting && canBoost) ? BOOST_SPEED : SPEED;

  head.x += Math.cos(head.angle) * speed;
  head.y += Math.sin(head.angle) * speed;

  if (boosting && canBoost) {
    maxLength -= 0.2;
  }

  if (!snake[0] || Math.hypot(head.x - snake[0].x, head.y - snake[0].y) > 4) {
    snake.unshift({ x: head.x, y: head.y });
  }

  while (snake.length > maxLength) snake.pop();

  socket.emit("update", {
    x: head.x,
    y: head.y,
    angle: head.angle,
    size: maxLength
  });

  cam.x += (head.x - cam.x) * 0.1;
  cam.y += (head.y - cam.y) * 0.1;
}

// DRAW
function draw() {

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  ctx.save();
  ctx.translate(canvas.width / 2 - cam.x, canvas.height / 2 - cam.y);

  drawSnake(head, snake, maxLength, "#00c97a");

  // OUTROS PLAYERS
  for (let id in otherPlayers) {

    if (id === socket.id) continue;

    let p = otherPlayers[id];

    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  ctx.restore();

  requestAnimationFrame(draw);
}

// DESENHO DA COBRA
function drawSnake(head, snake, size, color) {

  if (!snake.length) return;
  if (snake.length < 2) return;

  let thickness = 10 + (size / 80);

  ctx.beginPath();
  ctx.moveTo(snake[0].x, snake[0].y);

  for (let i = 1; i < snake.length - 2; i++) {
    const xc = (snake[i].x + snake[i + 1].x) / 2;
    const yc = (snake[i].y + snake[i + 1].y) / 2;
    ctx.quadraticCurveTo(snake[i].x, snake[i].y, xc, yc);
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.lineWidth = thickness + 4;
  ctx.strokeStyle = "#6affd2";
  ctx.stroke();

  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;
  ctx.stroke();

  const ex = Math.cos(head.angle);
  const ey = Math.sin(head.angle);

  const px = -ey;
  const py = ex;

  const eyeDist = thickness * 0.4;
  const forward = thickness * 0.2;

  const leftX = head.x + px * eyeDist + ex * forward;
  const leftY = head.y + py * eyeDist + ey * forward;

  const rightX = head.x - px * eyeDist + ex * forward;
  const rightY = head.y - py * eyeDist + ey * forward;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(leftX, leftY, thickness * 0.3, 0, Math.PI * 2);
  ctx.arc(rightX, rightY, thickness * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(leftX, leftY, thickness * 0.15, 0, Math.PI * 2);
  ctx.arc(rightX, rightY, thickness * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

draw();