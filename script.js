const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};
let myId = null;

// Recebe jogadores
socket.on("currentPlayers", (data) => {
  players = data;
});

socket.on("newPlayer", (player) => {
  players[player.id] = player;
});

socket.on("playerMoved", (player) => {
  if (players[player.id]) {
    players[player.id].x = player.x;
    players[player.id].y = player.y;
  }
});

socket.on("playerDisconnected", (id) => {
  delete players[id];
});

socket.on("connect", () => {
  myId = socket.id;
});

// Movimento
document.addEventListener("mousemove", (e) => {
  if (!myId) return;

  players[myId] = {
    x: e.clientX,
    y: e.clientY
  };

  socket.emit("move", players[myId]);
});

// Render
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];

    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = id === myId ? "lime" : "red";
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

draw();