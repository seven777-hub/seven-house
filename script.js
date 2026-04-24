let socket;

// tenta conectar sem quebrar o jogo
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

// player principal
let myPlayer = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// alvo (mouse/toque)
let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// SOCKET (se funcionar)
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

// 🖱️ MOUSE (PC)
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// 📱 TOQUE (CELULAR)
document.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  mouse.x = touch.clientX;
  mouse.y = touch.clientY;
});

// 🐍 MOVIMENTO SUAVE
function update() {
  const smooth = 0.08;

  myPlayer.x += (mouse.x - myPlayer.x) * smooth;
  myPlayer.y += (mouse.y - myPlayer.y) * smooth;

  // multiplayer (se tiver conectado)
  if (socket && myId) {
    players[myId] = {
      x: myPlayer.x,
      y: myPlayer.y
    };

    socket.emit("move", players[myId]);
  }
}

// 🎮 RENDER
function draw() {
  // fundo
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update();

  // se multiplayer ok
  if (socket && myId) {
    for (let id in players) {
      const p = players[id];
      if (!p) continue;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = id === myId ? "lime" : "red";
      ctx.fill();
    }
  } 
  // modo offline (sempre desenha você)
  else {
    ctx.beginPath();
    ctx.arc(myPlayer.x, myPlayer.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "lime";
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

draw();