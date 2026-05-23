-- Operacoes SQL equivalentes as rotas reais da API do Modulo 3.
-- Este arquivo documenta a manipulacao de dados executada pelo backend Express.
-- Os parametros nomeados, como :id, representam valores recebidos pelas rotas.

PRAGMA foreign_keys = ON;

-- ============================================================
-- Usuarios/Auth
-- ============================================================

-- POST /api/auth/cadastro
INSERT INTO usuarios (nome, email, senha, telefone)
VALUES (:nome, :email, :senha, :telefone);

INSERT INTO perfis_usuario (usuario_id, tipo, bairro, cidade, uf)
VALUES (:usuario_id, :tipo, :bairro, :cidade, :uf);

-- POST /api/auth/login
SELECT u.id, u.nome, u.email, u.telefone, u.criado_em,
       p.tipo, p.bairro, p.cidade, p.uf
FROM usuarios u
LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
WHERE u.email = :email
  AND u.senha = :senha;

-- GET /api/usuarios/:id
SELECT u.id, u.nome, u.email, u.telefone, u.criado_em,
       p.tipo, p.bairro, p.cidade, p.uf
FROM usuarios u
LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
WHERE u.id = :id;

-- ============================================================
-- Itens
-- ============================================================

-- GET /api/itens
SELECT i.*, u.nome AS doador_nome
FROM itens_doacao i
JOIN usuarios u ON u.id = i.doador_id
ORDER BY i.criado_em DESC, i.id DESC;

-- GET /api/itens com filtros opcionais de status/categoria
SELECT i.*, u.nome AS doador_nome
FROM itens_doacao i
JOIN usuarios u ON u.id = i.doador_id
WHERE (:status IS NULL OR i.status = :status)
  AND (:categoria IS NULL OR i.categoria = :categoria)
ORDER BY i.criado_em DESC, i.id DESC;

-- GET /api/itens/:id
SELECT i.*, u.nome AS doador_nome
FROM itens_doacao i
JOIN usuarios u ON u.id = i.doador_id
WHERE i.id = :id;

-- POST /api/itens
INSERT INTO itens_doacao
  (doador_id, titulo, descricao, categoria, estado_conservacao, localizacao)
VALUES
  (:doador_id, :titulo, :descricao, :categoria, :estado_conservacao, :localizacao);

-- PATCH /api/itens/:id/status
UPDATE itens_doacao
SET status = :status,
    atualizado_em = CURRENT_TIMESTAMP
WHERE id = :id;

-- DELETE /api/itens/:id
-- A rota executa estes comandos em transacao e remove arquivos fisicos de imagens quando possivel.
SELECT id
FROM threads
WHERE item_id = :item_id;

DELETE FROM mensagens
WHERE thread_id IN (
  SELECT id
  FROM threads
  WHERE item_id = :item_id
);

DELETE FROM threads
WHERE item_id = :item_id;

DELETE FROM imagens_item
WHERE item_id = :item_id;

DELETE FROM itens_doacao
WHERE id = :item_id;

-- ============================================================
-- Imagens
-- ============================================================

-- POST /api/itens/:id/imagens
INSERT INTO imagens_item
  (item_id, caminho, nome_arquivo, nome_original, mime_type, tamanho_bytes, rotation_deg, principal)
VALUES
  (:item_id, :caminho, :nome_arquivo, :nome_original, :mime_type, :tamanho_bytes, :rotation_deg, :principal);

-- GET /api/itens/:id/imagens
SELECT id, item_id, caminho, nome_arquivo, nome_original, mime_type,
       tamanho_bytes, rotation_deg, principal, criado_em
FROM imagens_item
WHERE item_id = :item_id
ORDER BY principal DESC, criado_em ASC, id ASC;

-- DELETE /api/imagens/:id
SELECT id, item_id, nome_arquivo
FROM imagens_item
WHERE id = :id;

DELETE FROM imagens_item
WHERE id = :id;

-- DELETE /api/itens/:id/imagens/:imagemId
SELECT id, item_id, nome_arquivo
FROM imagens_item
WHERE id = :imagem_id
  AND item_id = :item_id;

DELETE FROM imagens_item
WHERE id = :imagem_id
  AND item_id = :item_id;

-- ============================================================
-- Threads
-- ============================================================

-- POST /api/threads: localizar item e doador
SELECT id, doador_id
FROM itens_doacao
WHERE id = :item_id;

-- POST /api/threads: criar thread
INSERT INTO threads (item_id, doador_id, interessado_id)
VALUES (:item_id, :doador_id, :interessado_id);

-- POST /api/threads: reutilizar thread existente em caso de UNIQUE constraint
SELECT t.*, i.titulo AS item_titulo, d.nome AS doador_nome, a.nome AS interessado_nome
FROM threads t
JOIN itens_doacao i ON i.id = t.item_id
JOIN usuarios d ON d.id = t.doador_id
JOIN usuarios a ON a.id = t.interessado_id
WHERE t.item_id = :item_id
  AND t.doador_id = :doador_id
  AND t.interessado_id = :interessado_id;

-- GET /api/threads/usuario/:usuarioId
SELECT t.*, i.titulo AS item_titulo, d.nome AS doador_nome, a.nome AS interessado_nome,
       (
         SELECT COUNT(*)
         FROM mensagens m
         WHERE m.thread_id = t.id
           AND m.remetente_id <> :usuario_id
           AND m.lida = 0
       ) AS nao_lidas
FROM threads t
JOIN itens_doacao i ON i.id = t.item_id
JOIN usuarios d ON d.id = t.doador_id
JOIN usuarios a ON a.id = t.interessado_id
WHERE t.doador_id = :usuario_id
   OR t.interessado_id = :usuario_id
ORDER BY t.atualizado_em DESC, t.id DESC;

-- ============================================================
-- Mensagens
-- ============================================================

-- GET /api/mensagens/thread/:threadId?usuarioId=
-- Primeiro valida se o usuario participa da thread.
SELECT *
FROM threads
WHERE id = :thread_id
  AND (doador_id = :usuario_id OR interessado_id = :usuario_id);

-- Depois consulta mensagens da thread.
SELECT m.*, u.nome AS remetente_nome
FROM mensagens m
JOIN usuarios u ON u.id = m.remetente_id
WHERE m.thread_id = :thread_id
ORDER BY m.criado_em ASC, m.id ASC;

-- POST /api/mensagens
INSERT INTO mensagens (thread_id, remetente_id, texto)
VALUES (:thread_id, :remetente_id, :texto);

UPDATE threads
SET atualizado_em = CURRENT_TIMESTAMP
WHERE id = :thread_id;

-- PATCH /api/mensagens/thread/:threadId/lidas
UPDATE mensagens
SET lida = 1
WHERE thread_id = :thread_id
  AND remetente_id <> :usuario_id
  AND lida = 0;

-- DELETE /api/mensagens/:id
-- A rota valida se o usuario participa da thread da mensagem antes de remover.
SELECT m.id, m.thread_id
FROM mensagens m
JOIN threads t ON t.id = m.thread_id
WHERE m.id = :id
  AND (t.doador_id = :usuario_id OR t.interessado_id = :usuario_id);

DELETE FROM mensagens
WHERE id = :id;

-- ============================================================
-- Remocoes em cascata controlada
-- ============================================================

-- Remover mensagens de threads de um item.
DELETE FROM mensagens
WHERE thread_id IN (
  SELECT id
  FROM threads
  WHERE item_id = :item_id
);

-- Remover threads de um item.
DELETE FROM threads
WHERE item_id = :item_id;

-- Remover imagens de um item.
DELETE FROM imagens_item
WHERE item_id = :item_id;

-- Remover perfis/usuarios de teste quando aplicavel.
DELETE FROM perfis_usuario
WHERE usuario_id = :usuario_id;

DELETE FROM usuarios
WHERE id = :usuario_id;
