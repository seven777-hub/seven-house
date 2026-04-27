const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// SERVIR ARQUIVOS
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// ===== PLAYERS =====
let players = {};

function randomPos() {
  return (Math.random() - 0.5) * 2000;
}

// ===== CONEXÃO =====
io.on("connection", (socket) => {
  console.log("Player conectado:", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: randomPos(),
    y: randomPos(),
    angle: 0,
    size: 30
  };

  // envia estado completo ao entrar
  socket.emit("init", players);

  socket.on("update", (data) => {
    if (!players[socket.id]) return;

    players[socket.id] = {
      ...players[socket.id],
      x: data.x,
      y: data.y,
      angle: data.angle,
      size: data.size
    };
  });

  socket.on("disconnect", () => {
    console.log("Saiu:", socket.id);
    delete players[socket.id];
  });
});

// ===== LOOP GLOBAL (MULTIPLAYER REAL) =====
setInterval(() => {
  io.emit("state", players);
}, 50); // 20 FPS

// ===== START =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});