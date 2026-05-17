const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

function toId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function mapThread(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    itemTitulo: row.item_titulo,
    doadorId: row.doador_id,
    doadorNome: row.doador_nome,
    interessadoId: row.interessado_id,
    interessadoNome: row.interessado_nome,
    status: row.status,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function mapMensagem(row) {
  return {
    id: row.id,
    threadId: row.thread_id,
    remetenteId: row.remetente_id,
    remetenteNome: row.remetente_nome,
    texto: row.texto,
    lida: Boolean(row.lida),
    criadoEm: row.criado_em
  };
}

async function getThreadParticipante(db, threadId, usuarioId) {
  return db.get(
    `SELECT *
     FROM threads
     WHERE id = ?
       AND (doador_id = ? OR interessado_id = ?)`,
    [threadId, usuarioId, usuarioId]
  );
}

async function getThreadDetalhe(db, threadId) {
  return db.get(
    `SELECT t.*, i.titulo AS item_titulo, d.nome AS doador_nome, a.nome AS interessado_nome
     FROM threads t
     JOIN itens_doacao i ON i.id = t.item_id
     JOIN usuarios d ON d.id = t.doador_id
     JOIN usuarios a ON a.id = t.interessado_id
     WHERE t.id = ?`,
    [threadId]
  );
}

router.get("/threads/usuario/:usuarioId", async (req, res, next) => {
  try {
    const usuarioId = toId(req.params.usuarioId);

    if (!usuarioId) {
      return res.status(400).json({ erro: "ID de usuario invalido." });
    }

    const db = await getDb();
    const rows = await db.all(
      `SELECT t.*, i.titulo AS item_titulo, d.nome AS doador_nome, a.nome AS interessado_nome
       FROM threads t
       JOIN itens_doacao i ON i.id = t.item_id
       JOIN usuarios d ON d.id = t.doador_id
       JOIN usuarios a ON a.id = t.interessado_id
       WHERE t.doador_id = ? OR t.interessado_id = ?
       ORDER BY t.atualizado_em DESC, t.id DESC`,
      [usuarioId, usuarioId]
    );

    return res.json({ threads: rows.map(mapThread) });
  } catch (error) {
    return next(error);
  }
});

router.post("/threads", async (req, res, next) => {
  try {
    const itemId = toId(req.body.itemId);
    const interessadoId = toId(req.body.interessadoId);

    if (!itemId || !interessadoId) {
      return res.status(400).json({ erro: "itemId e interessadoId sao obrigatorios." });
    }

    const db = await getDb();
    const item = await db.get("SELECT id, doador_id FROM itens_doacao WHERE id = ?", [itemId]);

    if (!item) {
      return res.status(404).json({ erro: "Item nao encontrado." });
    }

    if (item.doador_id === interessadoId) {
      return res.status(400).json({ erro: "O doador nao pode abrir thread como interessado no proprio item." });
    }

    const usuario = await db.get("SELECT id FROM usuarios WHERE id = ?", [interessadoId]);

    if (!usuario) {
      return res.status(404).json({ erro: "Interessado nao encontrado." });
    }

    try {
      const result = await db.run(
        `INSERT INTO threads (item_id, doador_id, interessado_id)
         VALUES (?, ?, ?)`,
        [itemId, item.doador_id, interessadoId]
      );

      const thread = await getThreadDetalhe(db, result.lastID);
      return res.status(201).json({ thread: mapThread(thread) });
    } catch (error) {
      if (error && error.code === "SQLITE_CONSTRAINT") {
        const thread = await db.get(
          `SELECT t.*, i.titulo AS item_titulo, d.nome AS doador_nome, a.nome AS interessado_nome
           FROM threads t
           JOIN itens_doacao i ON i.id = t.item_id
           JOIN usuarios d ON d.id = t.doador_id
           JOIN usuarios a ON a.id = t.interessado_id
           WHERE t.item_id = ? AND t.doador_id = ? AND t.interessado_id = ?`,
          [itemId, item.doador_id, interessadoId]
        );

        return res.status(200).json({ thread: mapThread(thread) });
      }

      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

router.get("/mensagens/thread/:threadId", async (req, res, next) => {
  try {
    const threadId = toId(req.params.threadId);
    const usuarioId = toId(req.query.usuarioId);

    if (!threadId || !usuarioId) {
      return res.status(400).json({ erro: "threadId e usuarioId sao obrigatorios." });
    }

    const db = await getDb();
    const thread = await getThreadParticipante(db, threadId, usuarioId);

    if (!thread) {
      return res.status(403).json({ erro: "Usuario nao participa desta thread." });
    }

    const rows = await db.all(
      `SELECT m.*, u.nome AS remetente_nome
       FROM mensagens m
       JOIN usuarios u ON u.id = m.remetente_id
       WHERE m.thread_id = ?
       ORDER BY m.criado_em ASC, m.id ASC`,
      [threadId]
    );

    return res.json({ mensagens: rows.map(mapMensagem) });
  } catch (error) {
    return next(error);
  }
});

router.post("/mensagens", async (req, res, next) => {
  try {
    const threadId = toId(req.body.threadId);
    const remetenteId = toId(req.body.remetenteId);
    const texto = typeof req.body.texto === "string" ? req.body.texto.trim() : "";

    if (!threadId || !remetenteId || !texto) {
      return res.status(400).json({ erro: "threadId, remetenteId e texto sao obrigatorios." });
    }

    const db = await getDb();
    const thread = await getThreadParticipante(db, threadId, remetenteId);

    if (!thread) {
      return res.status(403).json({ erro: "Remetente nao participa desta thread." });
    }

    const result = await db.run(
      "INSERT INTO mensagens (thread_id, remetente_id, texto) VALUES (?, ?, ?)",
      [threadId, remetenteId, texto]
    );

    await db.run("UPDATE threads SET atualizado_em = CURRENT_TIMESTAMP WHERE id = ?", [threadId]);

    const mensagem = await db.get(
      `SELECT m.*, u.nome AS remetente_nome
       FROM mensagens m
       JOIN usuarios u ON u.id = m.remetente_id
       WHERE m.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({ mensagem: mapMensagem(mensagem) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/mensagens/thread/:threadId/lidas", async (req, res, next) => {
  try {
    const threadId = toId(req.params.threadId);
    const usuarioId = toId(req.body.usuarioId);

    if (!threadId || !usuarioId) {
      return res.status(400).json({ erro: "threadId e usuarioId sao obrigatorios." });
    }

    const db = await getDb();
    const thread = await getThreadParticipante(db, threadId, usuarioId);

    if (!thread) {
      return res.status(403).json({ erro: "Usuario nao participa desta thread." });
    }

    const result = await db.run(
      `UPDATE mensagens
       SET lida = 1
       WHERE thread_id = ?
         AND remetente_id <> ?
         AND lida = 0`,
      [threadId, usuarioId]
    );

    return res.json({ mensagensAtualizadas: result.changes });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
