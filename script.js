// ===== COBRA =====
if (snake.length > 2) {

  let thickness = 5 + (maxLength / 80); // corpo mais fino

  // ===== CORPO =====
  ctx.beginPath();
  ctx.moveTo(snake[0].x, snake[0].y);

  for (let i = 1; i < snake.length - 2; i++) {
    const xc = (snake[i].x + snake[i+1].x) / 2;
    const yc = (snake[i].y + snake[i+1].y) / 2;
    ctx.quadraticCurveTo(snake[i].x, snake[i].y, xc, yc);
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.lineWidth = thickness;
  ctx.strokeStyle = "#00c97a";
  ctx.stroke();

  // ===== CABEÇA (SEPARADA) =====
  const headRadius = thickness * 1.4;

  ctx.beginPath();
  ctx.arc(head.x, head.y, headRadius, 0, Math.PI * 2);

  // leve brilho
  const grad = ctx.createRadialGradient(
    head.x - headRadius/3,
    head.y - headRadius/3,
    2,
    head.x,
    head.y,
    headRadius
  );

  grad.addColorStop(0, "#6affd2");
  grad.addColorStop(1, "#00c97a");

  ctx.fillStyle = grad;
  ctx.fill();

  // ===== BOOST (PONTA ARDENDO) =====
  if (boosting && maxLength > 20) {
    ctx.beginPath();
    ctx.arc(head.x, head.y, headRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,120,0,0.4)";
    ctx.fill();
  }

  // ===== OLHOS NA CABEÇA =====
  const ex = Math.cos(head.angle);
  const ey = Math.sin(head.angle);

  const px = -ey;
  const py = ex;

  const eyeDist = headRadius * 0.5;
  const forward = headRadius * 0.3;

  let leftX = head.x + px * eyeDist + ex * forward;
  let leftY = head.y + py * eyeDist + ey * forward;

  let rightX = head.x - px * eyeDist + ex * forward;
  let rightY = head.y - py * eyeDist + ey * forward;

  // branco
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(leftX, leftY, headRadius * 0.25, 0, Math.PI * 2);
  ctx.arc(rightX, rightY, headRadius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // pupila
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(leftX, leftY, headRadius * 0.12, 0, Math.PI * 2);
  ctx.arc(rightX, rightY, headRadius * 0.12, 0, Math.PI * 2);
  ctx.fill();
}