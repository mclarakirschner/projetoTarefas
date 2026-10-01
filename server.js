const express = require("express");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "data", "db.json");

const STATUS = ["todo", "doing", "done"];
const PRIORIDADES = ["baixa", "media", "alta"];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- "Banco de dados" em arquivo JSON ----------
function ler() {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, "[]");
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function salvar(tarefas) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tarefas, null, 2));
}

// ---------- Rotas da API ----------
app.get("/api/tarefas", (req, res) => {
  res.json(ler());
});

app.post("/api/tarefas", (req, res) => {
  const { titulo, descricao = "", prioridade = "media", prazo = "" } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ erro: "O título é obrigatório." });
  }
  if (!PRIORIDADES.includes(prioridade)) {
    return res.status(400).json({ erro: "Prioridade inválida." });
  }

  const tarefa = {
    id: randomUUID(),
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    prioridade,
    prazo,
    status: "todo",
    criadaEm: new Date().toISOString(),
  };

  const tarefas = ler();
  tarefas.push(tarefa);
  salvar(tarefas);
  res.status(201).json(tarefa);
});

app.put("/api/tarefas/:id", (req, res) => {
  const tarefas = ler();
  const tarefa = tarefas.find((t) => t.id === req.params.id);
  if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada." });

  const { titulo, descricao, prioridade, prazo, status } = req.body;

  if (titulo !== undefined) {
    if (!titulo.trim()) return res.status(400).json({ erro: "Título vazio." });
    tarefa.titulo = titulo.trim();
  }
  if (descricao !== undefined) tarefa.descricao = descricao.trim();
  if (prazo !== undefined) tarefa.prazo = prazo;
  if (prioridade !== undefined) {
    if (!PRIORIDADES.includes(prioridade)) {
      return res.status(400).json({ erro: "Prioridade inválida." });
    }
    tarefa.prioridade = prioridade;
  }
  if (status !== undefined) {
    if (!STATUS.includes(status)) {
      return res.status(400).json({ erro: "Status inválido." });
    }
    tarefa.status = status;
  }

  salvar(tarefas);
  res.json(tarefa);
});

app.delete("/api/tarefas/:id", (req, res) => {
  const tarefas = ler();
  const restantes = tarefas.filter((t) => t.id !== req.params.id);
  if (restantes.length === tarefas.length) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }
  salvar(restantes);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});