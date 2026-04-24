const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// TESTE SIMPLES SEM SOCKET
function draw() {
  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(200, 200, 20, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}

draw();