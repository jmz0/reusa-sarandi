PRAGMA foreign_keys = ON;

-- Demonstracao CRUD executavel para o Modulo 3.
-- Este arquivo cria dados de teste, consulta, atualiza e remove esses dados.
-- O ROLLBACK final preserva a massa atual do banco.

BEGIN TRANSACTION;

-- Limpeza defensiva dentro da transacao, caso uma execucao anterior tenha sido interrompida.
DELETE FROM mensagens
WHERE thread_id IN (
  SELECT t.id
  FROM threads t
  JOIN itens_doacao i ON i.id = t.item_id
  WHERE i.titulo = 'Item CRUD Teste'
);

DELETE FROM threads
WHERE item_id IN (
  SELECT id
  FROM itens_doacao
  WHERE titulo = 'Item CRUD Teste'
);

DELETE FROM imagens_item
WHERE item_id IN (
  SELECT id
  FROM itens_doacao
  WHERE titulo = 'Item CRUD Teste'
);

DELETE FROM itens_doacao
WHERE titulo = 'Item CRUD Teste';

DELETE FROM perfis_usuario
WHERE usuario_id IN (
  SELECT id
  FROM usuarios
  WHERE email IN ('crud.doador@reusa.local', 'crud.interessado@reusa.local')
);

DELETE FROM usuarios
WHERE email IN ('crud.doador@reusa.local', 'crud.interessado@reusa.local');

-- INSERT: usuarios de teste.
INSERT INTO usuarios (nome, email, senha, telefone)
VALUES
  ('Doador CRUD Teste', 'crud.doador@reusa.local', '1234', '(44) 90000-0001'),
  ('Interessado CRUD Teste', 'crud.interessado@reusa.local', '1234', '(44) 90000-0002');

-- INSERT: perfis vinculados aos usuarios.
INSERT INTO perfis_usuario (usuario_id, tipo, bairro, cidade, uf)
SELECT id, 'pessoa_fisica', 'Centro', 'Sarandi', 'PR'
FROM usuarios
WHERE email IN ('crud.doador@reusa.local', 'crud.interessado@reusa.local');

-- SELECT: consultar usuarios de teste com perfil.
SELECT u.id, u.nome, u.email, p.tipo, p.bairro, p.cidade, p.uf
FROM usuarios u
JOIN perfis_usuario p ON p.usuario_id = u.id
WHERE u.email IN ('crud.doador@reusa.local', 'crud.interessado@reusa.local')
ORDER BY u.email;

-- INSERT: item de doacao vinculado ao doador de teste.
INSERT INTO itens_doacao
  (doador_id, titulo, descricao, categoria, estado_conservacao, status, localizacao)
VALUES
  (
    (SELECT id FROM usuarios WHERE email = 'crud.doador@reusa.local'),
    'Item CRUD Teste',
    'Item criado pelo arquivo queries.sql para demonstrar operacoes CRUD.',
    'moveis',
    'bom',
    'disponivel',
    'Centro'
  );

-- SELECT: consultar itens com dados do doador.
SELECT i.id, i.titulo, i.status, i.categoria, i.estado_conservacao,
       u.nome AS doador_nome, u.email AS doador_email
FROM itens_doacao i
JOIN usuarios u ON u.id = i.doador_id
WHERE i.titulo = 'Item CRUD Teste';

-- UPDATE: atualizar status do item.
UPDATE itens_doacao
SET status = 'reservado',
    atualizado_em = CURRENT_TIMESTAMP
WHERE titulo = 'Item CRUD Teste';

-- SELECT: validar status atualizado.
SELECT id, titulo, status, atualizado_em
FROM itens_doacao
WHERE titulo = 'Item CRUD Teste';

-- INSERT: imagem vinculada ao item.
INSERT INTO imagens_item
  (item_id, caminho, nome_arquivo, nome_original, mime_type, tamanho_bytes, rotation_deg, principal)
VALUES
  (
    (SELECT id FROM itens_doacao WHERE titulo = 'Item CRUD Teste'),
    '/uploads/crud-demo.jpg',
    'crud-demo.jpg',
    'crud-demo-original.jpg',
    'image/jpeg',
    12345,
    90,
    1
  );

-- SELECT: consultar imagens do item.
SELECT img.id, img.item_id, img.caminho, img.nome_original, img.mime_type,
       img.tamanho_bytes, img.rotation_deg, img.principal
FROM imagens_item img
JOIN itens_doacao i ON i.id = img.item_id
WHERE i.titulo = 'Item CRUD Teste';

-- INSERT: criar thread entre doador e interessado.
INSERT INTO threads (item_id, doador_id, interessado_id, status)
VALUES
  (
    (SELECT id FROM itens_doacao WHERE titulo = 'Item CRUD Teste'),
    (SELECT id FROM usuarios WHERE email = 'crud.doador@reusa.local'),
    (SELECT id FROM usuarios WHERE email = 'crud.interessado@reusa.local'),
    'aberta'
  );

-- SELECT: consultar thread com dados do item e usuarios.
SELECT t.id, t.status, i.titulo AS item_titulo,
       d.nome AS doador_nome, r.nome AS interessado_nome
FROM threads t
JOIN itens_doacao i ON i.id = t.item_id
JOIN usuarios d ON d.id = t.doador_id
JOIN usuarios r ON r.id = t.interessado_id
WHERE i.titulo = 'Item CRUD Teste';

-- INSERT: mensagem inicial na thread.
INSERT INTO mensagens (thread_id, remetente_id, texto, lida)
VALUES
  (
    (
      SELECT t.id
      FROM threads t
      JOIN itens_doacao i ON i.id = t.item_id
      WHERE i.titulo = 'Item CRUD Teste'
    ),
    (SELECT id FROM usuarios WHERE email = 'crud.interessado@reusa.local'),
    'Tenho interesse neste item de teste.',
    0
  );

-- SELECT: consultar mensagens da thread.
SELECT m.id, m.thread_id, u.nome AS remetente_nome, m.texto, m.lida, m.criado_em
FROM mensagens m
JOIN usuarios u ON u.id = m.remetente_id
JOIN threads t ON t.id = m.thread_id
JOIN itens_doacao i ON i.id = t.item_id
WHERE i.titulo = 'Item CRUD Teste'
ORDER BY m.criado_em ASC, m.id ASC;

-- UPDATE: marcar mensagem como lida.
UPDATE mensagens
SET lida = 1
WHERE thread_id IN (
  SELECT t.id
  FROM threads t
  JOIN itens_doacao i ON i.id = t.item_id
  WHERE i.titulo = 'Item CRUD Teste'
);

-- SELECT: validar mensagem lida.
SELECT m.id, m.texto, m.lida
FROM mensagens m
JOIN threads t ON t.id = m.thread_id
JOIN itens_doacao i ON i.id = t.item_id
WHERE i.titulo = 'Item CRUD Teste';

-- DELETE: remover mensagem de teste.
DELETE FROM mensagens
WHERE thread_id IN (
  SELECT t.id
  FROM threads t
  JOIN itens_doacao i ON i.id = t.item_id
  WHERE i.titulo = 'Item CRUD Teste'
);

-- DELETE: remover thread de teste.
DELETE FROM threads
WHERE item_id IN (
  SELECT id
  FROM itens_doacao
  WHERE titulo = 'Item CRUD Teste'
);

-- DELETE: remover imagem de teste.
DELETE FROM imagens_item
WHERE item_id IN (
  SELECT id
  FROM itens_doacao
  WHERE titulo = 'Item CRUD Teste'
);

-- DELETE: remover item de teste.
DELETE FROM itens_doacao
WHERE titulo = 'Item CRUD Teste';

-- DELETE: remover perfis e usuarios de teste.
DELETE FROM perfis_usuario
WHERE usuario_id IN (
  SELECT id
  FROM usuarios
  WHERE email IN ('crud.doador@reusa.local', 'crud.interessado@reusa.local')
);

DELETE FROM usuarios
WHERE email IN ('crud.doador@reusa.local', 'crud.interessado@reusa.local');

-- SELECT: validar que os registros de teste foram removidos dentro da transacao.
SELECT 'usuarios_teste_restantes' AS verificacao, COUNT(*) AS total
FROM usuarios
WHERE email IN ('crud.doador@reusa.local', 'crud.interessado@reusa.local');

SELECT 'itens_teste_restantes' AS verificacao, COUNT(*) AS total
FROM itens_doacao
WHERE titulo = 'Item CRUD Teste';

-- Preserva o banco original.
ROLLBACK;
