-- Usuarios
SELECT u.id, u.nome, u.email, u.telefone, u.criado_em,
       p.tipo, p.bairro, p.cidade, p.uf
FROM usuarios u
LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
WHERE u.id = :id;

-- Cadastro simples, sem hash de senha nesta etapa.
INSERT INTO usuarios (nome, email, senha, telefone)
VALUES (:nome, :email, :senha, :telefone);

-- Login simples, sem JWT nesta etapa.
SELECT id, nome, email, telefone, criado_em
FROM usuarios
WHERE email = :email AND senha = :senha;

-- Itens com dados do doador.
SELECT i.*, u.nome AS doador_nome
FROM itens_doacao i
JOIN usuarios u ON u.id = i.doador_id
WHERE (:status IS NULL OR i.status = :status)
ORDER BY i.criado_em DESC;

-- Detalhe de item.
SELECT i.*, u.nome AS doador_nome, u.email AS doador_email, u.telefone AS doador_telefone
FROM itens_doacao i
JOIN usuarios u ON u.id = i.doador_id
WHERE i.id = :id;

-- Criacao de item.
INSERT INTO itens_doacao
  (doador_id, titulo, descricao, categoria, estado_conservacao, localizacao)
VALUES
  (:doador_id, :titulo, :descricao, :categoria, :estado_conservacao, :localizacao);

-- Atualizacao de status.
UPDATE itens_doacao
SET status = :status,
    atualizado_em = CURRENT_TIMESTAMP
WHERE id = :id;

-- Imagens de um item.
SELECT id, item_id, caminho, nome_arquivo, nome_original, mime_type, tamanho_bytes, rotation_deg, principal, criado_em
FROM imagens_item
WHERE item_id = :item_id
ORDER BY principal DESC, criado_em ASC;

-- Threads de um usuario.
SELECT t.*, i.titulo AS item_titulo, d.nome AS doador_nome, a.nome AS interessado_nome
FROM threads t
JOIN itens_doacao i ON i.id = t.item_id
JOIN usuarios d ON d.id = t.doador_id
JOIN usuarios a ON a.id = t.interessado_id
WHERE t.doador_id = :usuario_id OR t.interessado_id = :usuario_id
ORDER BY t.atualizado_em DESC;

-- Mensagens de uma thread.
SELECT m.*, u.nome AS remetente_nome
FROM mensagens m
JOIN usuarios u ON u.id = m.remetente_id
WHERE m.thread_id = :thread_id
ORDER BY m.criado_em ASC, m.id ASC;
