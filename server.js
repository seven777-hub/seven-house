const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// 🔥 IMPORTANTE: cria o socket corretamente
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// 🔥 SERVIR ARQUIVOS
app.use(express.static(__dirname));

// 🔥 GARANTE QUE INDEX ABRE
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let players = {};

function randomPos() {
  return (Math.random() - 0.5) * 2000;
}

// 🔥 CONEXÃO
io.on("connection", (socket) => {
  console.log("Jogador conectado:", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: randomPos(),
    y: randomPos(),
    angle: 0,
    size: 40
  };

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

// 🔥 LOOP GLOBAL
setInterval(() => {
  io.emit("state", players);
}, 50);

// 🔥 PORTA CORRETA (Railway)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Rodando na porta", PORT);
});