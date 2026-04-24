const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos
app.use(express.static(__dirname));

// 👇 GARANTE QUE O INDEX ABRA
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Jogadores
let players = {};

io.on("connection", (socket) => {
  console.log("Jogador conectado:", socket.id);

  players[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500
  };

  socket.emit("currentPlayers", players);

  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    ...players[socket.id]
  });

  socket.on("move", (data) => {
    players[socket.id] = data;

    socket.broadcast.emit("playerMoved", {
      id: socket.id,
      ...data
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});