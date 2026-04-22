let usuario = localStorage.getItem("user") || "";
let salas = JSON.parse(localStorage.getItem("salas")) || [];
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

if (usuario) iniciar();

function entrar() {
  let nome = document.getElementById("nome").value;
  if (!nome) return alert("Digite um nome");

  localStorage.setItem("user", nome);
  usuario = nome;

  iniciar();
}

function iniciar() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("boasVindas").innerText =
    "Bem-vindo, " + usuario;

  atualizarSalas();
  atualizarRanking();
}

function criarSala() {
  let sala = "Sala " + (salas.length + 1);
  salas.push(sala);
  localStorage.setItem("salas", JSON.stringify(salas));
  atualizarSalas();
}

function atualizarSalas() {
  let lista = document.getElementById("salas");
  lista.innerHTML = "";

  salas.forEach(s => {
    let li = document.createElement("li");
    li.innerHTML = `${s} <button onclick="entrarSala('${s}')">Entrar</button>`;
    lista.appendChild(li);
  });
}

function entrarSala(sala) {
  alert("Entrou na " + sala);
}

function ganharPontos() {
  let player = ranking.find(p => p.nome === usuario);

  if (!player) {
    ranking.push({ nome: usuario, pontos: 10 });
  } else {
    player.pontos += 10;
  }

  localStorage.setItem("ranking", JSON.stringify(ranking));
  atualizarRanking();
}

function atualizarRanking() {
  let lista = document.getElementById("ranking");
  lista.innerHTML = "";

  ranking
    .sort((a, b) => b.pontos - a.pontos)
    .forEach(p => {
      let li = document.createElement("li");
      li.innerText = `${p.nome} - ${p.pontos} pts`;
      lista.appendChild(li);
    });
}