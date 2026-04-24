let socket;

// 🔥 TENTA conectar sem quebrar o jogo
try {
  socket = io(window.location.origin);
} catch (e) {
  console.log("Socket falhou, modo offline");
  socket = null;
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};
let myId = null;

let myPlayer = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// 🔥 Só ativa socket se existir
if (socket) {
  socket.on("connect", () => {
    myId = socket.id;
    console.log("Conectado:", myId);
  });

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
}

// Mouse
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Movimento
function update() {
  const smooth = 0.08;

  myPlayer.x += (mouse.x - myPlayer.x) * smooth;
  myPlayer.y += (mouse.y - myPlayer.y) * smooth;

  // modo offline
  if (!socket || !myId) return;

  players[myId] = {
    x: myPlayer.x,
    y: myPlayer.y
  };

  socket.emit("move", players[myId]);
}

// Render
function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  // 🔥 Se multiplayer falhar, desenha pelo menos você
  if (!socket || !myId) {
    ctx.beginPath();
    ctx.arc(myPlayer.x, myPlayer.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "lime";
    ctx.fill();
  } else {
    for (let id in players) {
      const p = players[id];
      if (!p) continue;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = id === myId ? "lime" : "red";
      ctx.fill();
    }
  }

  requestAnimationFrame(draw);
}

draw();