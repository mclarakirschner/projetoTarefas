const API = "/api/tarefas";
const $ = (sel) => document.querySelector(sel);

const NOMES_PRIORIDADE = { alta: "Alta", media: "Média", baixa: "Baixa" };

let tarefas = [];
let editandoId = null;

// ---------- Comunicação com a API ----------
async function carregar() {
  const resp = await fetch(API);
  tarefas = await resp.json();
  render();
}

async function criar(dados) {
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
}

async function atualizar(id, dados) {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
}

async function excluir(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
}

// ---------- Utilitários ----------
function hoje() {
  // Data local no formato AAAA-MM-DD (evita erro de fuso horário)
  return new Date().toLocaleDateString("sv-SE");
}

function formatarData(iso) {
  const [, m, d] = iso.split("-");
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${Number(d)} ${meses[Number(m) - 1]}`;
}

function estaAtrasada(t) {
  return t.prazo && t.prazo < hoje() && t.status !== "done";
}

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

// Cria um ícone a partir da biblioteca definida no index.html
function icone(nome) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "ic");
  const use = document.createElementNS(ns, "use");
  use.setAttribute("href", `#i-${nome}`);
  svg.appendChild(use);
  return svg;
}

function chip(classe, nomeIcone, texto) {
  const c = el("span", `chip ${classe}`);
  c.appendChild(icone(nomeIcone));
  c.append(texto);
  return c;
}

function botaoIcone(nomeIcone, titulo, classe = "") {
  const b = el("button", classe);
  b.title = titulo;
  b.setAttribute("aria-label", titulo);
  b.appendChild(icone(nomeIcone));
  return b;
}

// ---------- Renderização ----------
function criarCard(t) {
  const card = el("article", `card${t.status === "done" ? " feita" : ""}`);
  card.draggable = true;
  card.dataset.id = t.id;

  card.appendChild(el("h3", "", t.titulo));
  if (t.descricao) card.appendChild(el("p", "", t.descricao));

  const meta = el("div", "card-meta");
  meta.appendChild(chip(t.prioridade, "flag", NOMES_PRIORIDADE[t.prioridade]));

  if (t.prazo) {
    if (estaAtrasada(t)) {
      meta.appendChild(chip("atrasada", "alert", `${formatarData(t.prazo)} · atrasada`));
    } else {
      meta.appendChild(chip("", "calendar", formatarData(t.prazo)));
    }
  }

  const botoes = el("div", "card-botoes");

  const btnEditar = botaoIcone("edit", "Editar");
  btnEditar.addEventListener("click", () => abrirModal(t));

  const btnExcluir = botaoIcone("trash", "Excluir", "perigo");
  btnExcluir.addEventListener("click", async () => {
    if (confirm(`Excluir "${t.titulo}"?`)) {
      await excluir(t.id);
      carregar();
    }
  });

  botoes.append(btnEditar, btnExcluir);
  meta.appendChild(botoes);
  card.appendChild(meta);

  // Arrastar e soltar
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", t.id);
    card.classList.add("arrastando");
  });
  card.addEventListener("dragend", () => card.classList.remove("arrastando"));

  return card;
}

function criarVazio() {
  const v = el("div", "vazio");
  v.appendChild(icone("inbox"));
  v.appendChild(el("span", "", "Nada por aqui."));
  return v;
}

function render() {
  const busca = $("#busca").value.toLowerCase();
  const prioridade = $("#filtroPrioridade").value;

  document.querySelectorAll(".coluna").forEach((coluna) => {
    const status = coluna.dataset.status;
    const container = coluna.querySelector(".cards");
    container.innerHTML = "";

    const itens = tarefas.filter(
      (t) =>
        t.status === status &&
        (t.titulo.toLowerCase().includes(busca) ||
          t.descricao.toLowerCase().includes(busca)) &&
        (!prioridade || t.prioridade === prioridade)
    );

    coluna.querySelector(".qtd").textContent = itens.length;

    if (itens.length === 0) {
      container.appendChild(criarVazio());
    } else {
      itens.forEach((t) => container.appendChild(criarCard(t)));
    }
  });

  atualizarEstatisticas();
}

function atualizarEstatisticas() {
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.status === "done").length;
  const atrasadas = tarefas.filter(estaAtrasada).length;
  const pct = total ? Math.round((concluidas / total) * 100) : 0;

  $("#statTotal").textContent = total;
  $("#statAtrasadas").textContent = atrasadas;
  $("#statPct").textContent = `${pct}%`;
  $("#barraProgresso").style.width = `${pct}%`;
}

// ---------- Modal ----------
function abrirModal(tarefa = null) {
  editandoId = tarefa ? tarefa.id : null;
  $("#modalTitulo").textContent = tarefa ? "Editar tarefa" : "Nova tarefa";
  $("#titulo").value = tarefa ? tarefa.titulo : "";
  $("#descricao").value = tarefa ? tarefa.descricao : "";
  $("#prioridade").value = tarefa ? tarefa.prioridade : "media";
  $("#prazo").value = tarefa ? tarefa.prazo : "";
  $("#modal").showModal();
  $("#titulo").focus();
}

$("#btnNova").addEventListener("click", () => abrirModal());
$("#btnCancelar").addEventListener("click", () => $("#modal").close());

$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    titulo: $("#titulo").value,
    descricao: $("#descricao").value,
    prioridade: $("#prioridade").value,
    prazo: $("#prazo").value,
  };

  if (editandoId) {
    await atualizar(editandoId, dados);
  } else {
    await criar(dados);
  }

  $("#modal").close();
  carregar();
});

// ---------- Soltar nas colunas ----------
document.querySelectorAll(".coluna").forEach((coluna) => {
  coluna.addEventListener("dragover", (e) => {
    e.preventDefault();
    coluna.classList.add("sobre");
  });

  coluna.addEventListener("dragleave", (e) => {
    if (!coluna.contains(e.relatedTarget)) coluna.classList.remove("sobre");
  });

  coluna.addEventListener("drop", async (e) => {
    e.preventDefault();
    coluna.classList.remove("sobre");
    const id = e.dataTransfer.getData("text/plain");
    await atualizar(id, { status: coluna.dataset.status });
    carregar();
  });
});

// ---------- Busca e filtro ----------
$("#busca").addEventListener("input", render);
$("#filtroPrioridade").addEventListener("change", render);

// ---------- Tema ----------
function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  // No tema escuro mostra o sol (para voltar ao claro) e vice-versa
  $("#btnTema").replaceChildren(icone(tema === "escuro" ? "sun" : "moon"));
  localStorage.setItem("tema", tema);
}

$("#btnTema").addEventListener("click", () => {
  const atual = document.documentElement.dataset.tema;
  aplicarTema(atual === "escuro" ? "claro" : "escuro");
});

aplicarTema(localStorage.getItem("tema") || "claro");

// ---------- Data no cabeçalho ----------
$("#dataHoje").textContent = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

// ---------- Início ----------
carregar();