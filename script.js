  const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Estado dos jogadores recebidos do servidor
let players = {};
let myId = null;

// Posição real do meu player (suave)
let myPlayer = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// Mouse alvo
let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// Recebe jogadores atuais
socket.on("currentPlayers", (data) => {
  players = data;
});

// Novo jogador
socket.on("newPlayer", (player) => {
  players[player.id] = player;
});

// Movimento de outros jogadores
socket.on("playerMoved", (player) => {
  if (players[player.id]) {
    players[player.id].x = player.x;
    players[player.id].y = player.y;
  }
});

// Player saiu
socket.on("playerDisconnected", (id) => {
  delete players[id];
});

// Meu ID
socket.on("connect", () => {
  myId = socket.id;
});

// 👇 CAPTURA DO MOUSE (não move direto mais!)
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// 🐍 MOVIMENTO SUAVE (ESTILO SLITHER)
function updatePlayer() {
  const smooth = 0.08;

  myPlayer.x += (mouse.x - myPlayer.x) * smooth;
  myPlayer.y += (mouse.y - myPlayer.y) * smooth;

  // atualiza posição local
  players[myId] = {
    x: myPlayer.x,
    y: myPlayer.y
  };

  // envia pro servidor
  socket.emit("move", {
    x: myPlayer.x,
    y: myPlayer.y
  });
}

// 🎮 DESENHO DO JOGO
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();

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