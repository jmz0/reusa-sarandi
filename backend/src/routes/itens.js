const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const multer = require("multer");
const { getDb } = require("../db");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
const statusPermitidos = new Set(["disponivel", "reservado", "doado", "cancelado"]);
const estadosPermitidos = new Set(["novo", "bom", "usado", "precisa_reparo"]);

function toId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function mapImagem(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    caminho: row.caminho,
    nomeArquivo: row.nome_arquivo,
    nomeOriginal: row.nome_original,
    mimeType: row.mime_type,
    tamanhoBytes: row.tamanho_bytes,
    principal: Boolean(row.principal),
    criadoEm: row.criado_em
  };
}

function mapItem(row, imagens = []) {
  return {
    id: row.id,
    doadorId: row.doador_id,
    doadorNome: row.doador_nome,
    titulo: row.titulo,
    descricao: row.descricao,
    categoria: row.categoria,
    estadoConservacao: row.estado_conservacao,
    status: row.status,
    localizacao: row.localizacao,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    imagens
  };
}

async function itemExiste(db, itemId) {
  return db.get("SELECT id FROM itens_doacao WHERE id = ?", [itemId]);
}

async function getImagens(db, itemId) {
  const rows = await db.all(
    `SELECT id, item_id, caminho, nome_arquivo, nome_original, mime_type, tamanho_bytes, principal, criado_em
     FROM imagens_item
     WHERE item_id = ?
     ORDER BY principal DESC, criado_em ASC, id ASC`,
    [itemId]
  );

  return rows.map(mapImagem);
}

const storage = multer.diskStorage({
  destination: async (_req, _file, callback) => {
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      callback(null, uploadsDir);
    } catch (error) {
      callback(error);
    }
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = extension && extension.length <= 10 ? extension : "";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
    callback(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return callback(new Error("Apenas arquivos de imagem sao aceitos."));
    }

    return callback(null, true);
  }
});

router.get("/itens", async (req, res, next) => {
  try {
    const { status, categoria } = req.query;

    if (status && !statusPermitidos.has(status)) {
      return res.status(400).json({ erro: "Status invalido." });
    }

    const db = await getDb();
    const params = [];
    const where = [];

    if (status) {
      where.push("i.status = ?");
      params.push(status);
    }

    if (categoria) {
      where.push("i.categoria = ?");
      params.push(categoria);
    }

    const rows = await db.all(
      `SELECT i.*, u.nome AS doador_nome
       FROM itens_doacao i
       JOIN usuarios u ON u.id = i.doador_id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY i.criado_em DESC, i.id DESC`,
      params
    );

    const imagens = await db.all(
      `SELECT id, item_id, caminho, nome_arquivo, nome_original, mime_type, tamanho_bytes, principal, criado_em
       FROM imagens_item
       ORDER BY principal DESC, criado_em ASC, id ASC`
    );

    const imagensPorItem = imagens.reduce((acc, row) => {
      if (!acc[row.item_id]) {
        acc[row.item_id] = [];
      }
      acc[row.item_id].push(mapImagem(row));
      return acc;
    }, {});

    return res.json({
      itens: rows.map((row) => mapItem(row, imagensPorItem[row.id] || []))
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/itens/:id", async (req, res, next) => {
  try {
    const id = toId(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "ID de item invalido." });
    }

    const db = await getDb();
    const item = await db.get(
      `SELECT i.*, u.nome AS doador_nome
       FROM itens_doacao i
       JOIN usuarios u ON u.id = i.doador_id
       WHERE i.id = ?`,
      [id]
    );

    if (!item) {
      return res.status(404).json({ erro: "Item nao encontrado." });
    }

    return res.json({ item: mapItem(item, await getImagens(db, id)) });
  } catch (error) {
    return next(error);
  }
});

router.post("/itens", async (req, res, next) => {
  try {
    const { doadorId, titulo, descricao, categoria, estadoConservacao, localizacao } = req.body;
    const doador = toId(doadorId);
    const estado = estadoConservacao || "bom";

    if (!doador || !titulo || !descricao) {
      return res.status(400).json({ erro: "doadorId, titulo e descricao sao obrigatorios." });
    }

    if (!estadosPermitidos.has(estado)) {
      return res.status(400).json({ erro: "Estado de conservacao invalido." });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO itens_doacao
        (doador_id, titulo, descricao, categoria, estado_conservacao, localizacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        doador,
        titulo.trim(),
        descricao.trim(),
        categoria || "geral",
        estado,
        localizacao || null
      ]
    );

    const item = await db.get(
      `SELECT i.*, u.nome AS doador_nome
       FROM itens_doacao i
       JOIN usuarios u ON u.id = i.doador_id
       WHERE i.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({ item: mapItem(item, []) });
  } catch (error) {
    if (error && error.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ erro: "Nao foi possivel criar o item. Verifique o doador informado." });
    }

    return next(error);
  }
});

router.patch("/itens/:id/status", async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ erro: "ID de item invalido." });
    }

    if (!statusPermitidos.has(status)) {
      return res.status(400).json({ erro: "Status invalido." });
    }

    const db = await getDb();
    const result = await db.run(
      `UPDATE itens_doacao
       SET status = ?, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ erro: "Item nao encontrado." });
    }

    const item = await db.get(
      `SELECT i.*, u.nome AS doador_nome
       FROM itens_doacao i
       JOIN usuarios u ON u.id = i.doador_id
       WHERE i.id = ?`,
      [id]
    );

    return res.json({ item: mapItem(item, await getImagens(db, id)) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/itens/:id", async (req, res, next) => {
  try {
    const id = toId(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "ID de item invalido." });
    }

    const db = await getDb();
    const imagens = await getImagens(db, id);
    const result = await db.run("DELETE FROM itens_doacao WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ erro: "Item nao encontrado." });
    }

    await Promise.all(
      imagens.map((imagem) =>
        fs.unlink(path.join(uploadsDir, path.basename(imagem.nomeArquivo))).catch(() => undefined)
      )
    );

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post("/itens/:id/imagens", upload.array("imagens", 5), async (req, res, next) => {
  const id = toId(req.params.id);
  const files = req.files || [];

  try {
    if (!id) {
      await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => undefined)));
      return res.status(400).json({ erro: "ID de item invalido." });
    }

    if (!files.length) {
      return res.status(400).json({ erro: "Envie ao menos uma imagem no campo imagens." });
    }

    const db = await getDb();
    const item = await itemExiste(db, id);

    if (!item) {
      await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => undefined)));
      return res.status(404).json({ erro: "Item nao encontrado." });
    }

    const imagensAtuais = await getImagens(db, id);

    await db.exec("BEGIN");
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const principal = imagensAtuais.length === 0 && index === 0 ? 1 : 0;

        await db.run(
          `INSERT INTO imagens_item
            (item_id, caminho, nome_arquivo, nome_original, mime_type, tamanho_bytes, principal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            `/uploads/${file.filename}`,
            file.filename,
            file.originalname,
            file.mimetype,
            file.size,
            principal
          ]
        );
      }

      await db.exec("COMMIT");
    } catch (error) {
      await db.exec("ROLLBACK");
      await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => undefined)));
      throw error;
    }

    return res.status(201).json({ imagens: await getImagens(db, id) });
  } catch (error) {
    return next(error);
  }
});

router.get("/itens/:id/imagens", async (req, res, next) => {
  try {
    const id = toId(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "ID de item invalido." });
    }

    const db = await getDb();
    const item = await itemExiste(db, id);

    if (!item) {
      return res.status(404).json({ erro: "Item nao encontrado." });
    }

    return res.json({ imagens: await getImagens(db, id) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
