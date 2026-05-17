const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

function publicUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    criadoEm: row.criado_em,
    perfil: {
      tipo: row.tipo,
      bairro: row.bairro,
      cidade: row.cidade,
      uf: row.uf
    }
  };
}

router.post("/auth/cadastro", async (req, res, next) => {
  try {
    const { nome, email, senha, telefone, tipo, bairro, cidade, uf } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "nome, email e senha sao obrigatorios." });
    }

    const db = await getDb();

    await db.exec("BEGIN");
    try {
      const result = await db.run(
        "INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
        [nome.trim(), email.trim().toLowerCase(), senha, telefone || null]
      );

      await db.run(
        `INSERT INTO perfis_usuario (usuario_id, tipo, bairro, cidade, uf)
         VALUES (?, ?, ?, ?, ?)`,
        [
          result.lastID,
          tipo || "pessoa_fisica",
          bairro || null,
          cidade || "Sarandi",
          (uf || "PR").toUpperCase()
        ]
      );

      await db.exec("COMMIT");

      const usuario = await db.get(
        `SELECT u.id, u.nome, u.email, u.telefone, u.criado_em,
                p.tipo, p.bairro, p.cidade, p.uf
         FROM usuarios u
         LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
         WHERE u.id = ?`,
        [result.lastID]
      );

      return res.status(201).json({ usuario: publicUser(usuario) });
    } catch (error) {
      await db.exec("ROLLBACK");

      if (error && error.code === "SQLITE_CONSTRAINT") {
        return res.status(409).json({ erro: "Nao foi possivel cadastrar. Verifique email e dados do perfil." });
      }

      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "email e senha sao obrigatorios." });
    }

    const db = await getDb();
    const usuario = await db.get(
      `SELECT u.id, u.nome, u.email, u.telefone, u.criado_em,
              p.tipo, p.bairro, p.cidade, p.uf
       FROM usuarios u
       LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
       WHERE u.email = ? AND u.senha = ?`,
      [email.trim().toLowerCase(), senha]
    );

    if (!usuario) {
      return res.status(401).json({ erro: "Credenciais invalidas." });
    }

    return res.json({ usuario: publicUser(usuario) });
  } catch (error) {
    return next(error);
  }
});

router.get("/usuarios/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: "ID de usuario invalido." });
    }

    const db = await getDb();
    const usuario = await db.get(
      `SELECT u.id, u.nome, u.email, u.telefone, u.criado_em,
              p.tipo, p.bairro, p.cidade, p.uf
       FROM usuarios u
       LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
       WHERE u.id = ?`,
      [id]
    );

    if (!usuario) {
      return res.status(404).json({ erro: "Usuario nao encontrado." });
    }

    return res.json({ usuario: publicUser(usuario) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
