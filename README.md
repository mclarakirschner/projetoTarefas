# Quadro — Kanban com Node.js

Um quadro Kanban simples e bonito para organizar tarefas em três colunas: **A fazer**, **Em andamento** e **Concluído**. Tem backend próprio em Node.js + Express, API REST, arrastar e soltar, busca, filtro por prioridade, painel de estatísticas e modo escuro.

Não precisa de banco de dados: os dados ficam salvos em um arquivo JSON.

## Funcionalidades

- Criar, editar e excluir tarefas
- Arrastar e soltar cards entre as colunas
- Prioridade (baixa, média, alta) e prazo
- Aviso visual de tarefas atrasadas
- Busca por título ou descrição em tempo real
- Filtro por prioridade
- Estatísticas: total, atrasadas e porcentagem concluída, com barra de progresso
- Modo claro e escuro (a escolha fica salva no navegador)
- Layout responsivo (no celular as colunas empilham)

## Tecnologias

| Camada   | Tecnologia                                   |
| -------- | -------------------------------------------- |
| Backend  | Node.js, Express                             |
| Frontend | HTML, CSS e JavaScript puro (sem frameworks) |
| Dados    | Arquivo JSON (`data/db.json`)                |
| Visual   | Fontes Fraunces e Instrument Sans, ícones SVG |

## Pré-requisitos

- [Node.js](https://nodejs.org) versão **18.11 ou superior** (recomendado: LTS)

Para conferir a versão instalada:

```bash
node -v
```

## Como rodar

1. Abra a pasta do projeto no VS Code.
2. Abra o terminal integrado (`` Ctrl+` ``) e instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor:

   ```bash
   npm run dev
   ```

   O modo `dev` reinicia o servidor sozinho quando você altera o `server.js`. Para rodar sem isso, use `npm start`.

4. Acesse no navegador: **http://localhost:3000**

> As fontes são carregadas do Google Fonts, então é necessário estar online na primeira vez. Sem internet, o site funciona normalmente com fontes de reserva (Georgia e fonte padrão do sistema).

## Estrutura do projeto

```
kanban-app/
├── package.json
├── server.js          # Servidor Express e API REST
├── data/              # Criada automaticamente
│   └── db.json        # Onde as tarefas ficam salvas
└── public/
    ├── index.html     # Estrutura da página e biblioteca de ícones
    ├── style.css      # Visual, temas claro/escuro e responsividade
    └── app.js         # Lógica do frontend (API, cards, drag and drop)
```

## API

Base: `http://localhost:3000/api/tarefas`

| Método | Rota                | Descrição                    |
| ------ | ------------------- | ---------------------------- |
| GET    | `/api/tarefas`      | Lista todas as tarefas       |
| POST   | `/api/tarefas`      | Cria uma tarefa              |
| PUT    | `/api/tarefas/:id`  | Atualiza uma tarefa          |
| DELETE | `/api/tarefas/:id`  | Remove uma tarefa            |

### Formato de uma tarefa

```json
{
  "id": "b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "titulo": "Escrever o relatório",
  "descricao": "Fechar os números do mês",
  "prioridade": "alta",
  "prazo": "2026-10-15",
  "status": "doing",
  "criadaEm": "2026-10-01T14:30:00.000Z"
}
```

### Valores aceitos

- `prioridade`: `baixa`, `media` ou `alta`
- `status`: `todo`, `doing` ou `done`
- `prazo`: data no formato `AAAA-MM-DD` (opcional)

### Exemplos com curl

Criar uma tarefa:

```bash
curl -X POST http://localhost:3000/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Estudar Node","prioridade":"alta","prazo":"2026-10-20"}'
```

Mover uma tarefa para "Concluído":

```bash
curl -X PUT http://localhost:3000/api/tarefas/ID_DA_TAREFA \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'
```

Excluir uma tarefa:

```bash
curl -X DELETE http://localhost:3000/api/tarefas/ID_DA_TAREFA
```

Erros de validação retornam status `400` com uma mensagem, por exemplo `{ "erro": "O título é obrigatório." }`. Tarefas inexistentes retornam `404`.

## Personalização

**Cores e fontes:** edite as variáveis no topo do `public/style.css`. Cada tema (`:root` para o claro, `[data-tema="escuro"]` para o escuro) tem suas próprias cores.

```css
:root {
  --bg: #f3efe6;         /* fundo da página */
  --destaque: #c2410c;   /* cor de destaque (botões, barra, ícones) */
  --tinta: #1c1a17;      /* cor do texto */
}
```

Por exemplo, trocar `--destaque` por `#1d4ed8` deixa o tema azul-cobalto.

**Ícones:** ficam no começo do `public/index.html`, dentro de `<symbol>`. Para adicionar um novo, copie o conteúdo de um SVG de [lucide.dev](https://lucide.dev) para um novo `<symbol id="i-nome">` e use com `<use href="#i-nome"/>`.

**Porta:** altere a constante `PORT` no `server.js`.

## Solução de problemas

| Problema | O que fazer |
| -------- | ----------- |
| `npm` ou `node` não é reconhecido | Instale o Node.js e reabra o VS Code |
| `Error: Cannot find module 'express'` | Rode `npm install` na pasta do projeto |
| `EADDRINUSE` (porta em uso) | Feche o outro processo na porta 3000 ou mude o `PORT` |
| `node --watch` não funciona | Atualize o Node.js para 18.11+ ou use `npm start` |
| O visual não atualiza | Recarregue sem cache com `Ctrl+F5` |
| Quero apagar todas as tarefas | Pare o servidor e apague o arquivo `data/db.json` |

## Limitações

- O armazenamento em arquivo JSON serve para uso pessoal ou aprendizado. Para vários usuários simultâneos, o ideal é migrar para um banco de dados.
- Não há autenticação: qualquer pessoa com acesso ao endereço do servidor vê e edita as tarefas.

## Ideias para evoluir

- Trocar o JSON por **SQLite** ou **MongoDB**
- Adicionar **login de usuários** (JWT)
- Criar **vários quadros** e etiquetas coloridas
- Reordenar cards dentro da mesma coluna
- Migrar o frontend para **React** ou **Vue**
- Publicar online (Render, Railway)

## Licença

Projeto livre para estudo e uso pessoal. Adapte como quiser.
