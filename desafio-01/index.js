const express = require("express");

const app = express();

const projects = [
  { id: "1", title: "Sistema de Estoque", tasks: [] },
  { id: "2", title: "Sistema Financeiro", tasks: [] },
  { id: "3", title: "Sistema de Cursos", tasks: [] },
  { id: "4", title: "Sistema de Pagamento", tasks: [] },
  { id: "5", title: "Sistema de Vendas", tasks: ["Modelar Esquemas"] }
];

let contador = 0;

app.use(express.json());

app.use((req, res, next) => {
  console.log(contador);
  contador += 1;
  next();
});

const projectExisteMiddleware = (req, res, next) => {
  const { id } = req.params;
  for (let i = 0; i < projects.length; i += 1) {
    if (projects[i].id === id) {
      req.index = i;
      return next();
    }
  }
  return res.status(400).json({ error: "Project does not exists" });
};

app.post("/projects", (req, res) => {
  const { id, title } = req.body;
  projects.push({ id, title, tasks: [] });
  return res.json(projects);
});

app.get("/projects", (req, res) => res.json(projects));

app.get("/projects/:id", projectExisteMiddleware, (req, res) =>
  res.json(projects[req.index])
);

app.put("/projects/:id", projectExisteMiddleware, (req, res) => {
  const { index } = req;
  const { id, title } = req.body;
  projects[index] = { id, title, tasks: [] };
  return res.json(projects);
});

app.delete("/projects/:id", projectExisteMiddleware, (req, res) => {
  const { index } = req;
  projects.splice(index, 1);
  return res.end();
});

app.post("/projects/:id/tasks", projectExisteMiddleware, (req, res) => {
  const { index } = req;
  const { task } = req.body;
  projects[index].tasks.push(task);
  return res.json(projects);
});

app.listen(3000);
