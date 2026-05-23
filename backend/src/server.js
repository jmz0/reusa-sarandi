const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const itensRoutes = require("./routes/itens");
const mensagensRoutes = require("./routes/mensagens");
const { getDb } = require("./db");

const app = express();
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", async (_req, res, next) => {
  try {
    await getDb();
    return res.json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

app.use("/api", authRoutes);
app.use("/api", itensRoutes);
app.use("/api", mensagensRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: `Rota nao encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  if (error && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ erro: "Imagem excede o limite de 5 MB." });
  }

  if (error && error.message === "Apenas arquivos de imagem sao aceitos.") {
    return res.status(400).json({ erro: error.message });
  }

  console.error(error);
  return res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(port, host, () => {
  console.log(`Backend Reusa Sarandi em http://${host}:${port}`);
});
