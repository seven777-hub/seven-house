const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let players = {};

function randomPos() {
  return (Math.random() - 0.5) * 2000;
}

io.on("connection", (socket) => {

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
    delete players[socket.id];
  });
});

// LOOP GLOBAL
setInterval(() => {
  io.emit("state", players);
}, 50);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});