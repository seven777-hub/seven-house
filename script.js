  console.log("SCRIPT CARREGOU");

const socket = io();

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

socket.on("connect", () => {
  console.log("CONECTADO");
  myId = socket.id;
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

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function update() {
  const smooth = 0.08;

  myPlayer.x += (mouse.x - myPlayer.x) * smooth;
  myPlayer.y += (mouse.y - myPlayer.y) * smooth;

  players[myId] = {
    x: myPlayer.x,
    y: myPlayer.y
  };

  socket.emit("move", players[myId]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();

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