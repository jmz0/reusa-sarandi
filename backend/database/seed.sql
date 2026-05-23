PRAGMA foreign_keys = ON;

INSERT INTO usuarios (id, nome, email, senha, telefone) VALUES
  (1, 'Ana Souza', 'ana@reusa.local', '1234', '(44) 99999-0001'),
  (2, 'Bruno Lima', 'bruno@reusa.local', '1234', '(44) 99999-0002'),
  (3, 'Casa Comunitaria Sarandi', 'contato@casa.local', '1234', '(44) 99999-0003');

INSERT INTO perfis_usuario (usuario_id, tipo, bairro, cidade, uf) VALUES
  (1, 'pessoa_fisica', 'Centro', 'Sarandi', 'PR'),
  (2, 'pessoa_fisica', 'Jardim Independencia', 'Sarandi', 'PR'),
  (3, 'entidade', 'Parque Alvamar', 'Sarandi', 'PR');

INSERT INTO itens_doacao
  (id, doador_id, titulo, descricao, categoria, estado_conservacao, status, localizacao)
VALUES
  (1, 1, 'Mesa de estudo', 'Mesa pequena em bom estado, ideal para estudos.', 'moveis', 'bom', 'disponivel', 'Centro'),
  (2, 1, 'Livros didaticos', 'Colecao de livros para ensino fundamental.', 'livros', 'usado', 'disponivel', 'Centro'),
  (3, 3, 'Cadeiras plasticas', 'Conjunto com quatro cadeiras plasticas.', 'moveis', 'bom', 'reservado', 'Parque Alvamar');

INSERT INTO threads (id, item_id, doador_id, interessado_id, status) VALUES
  (1, 1, 1, 2, 'aberta');

INSERT INTO mensagens (thread_id, remetente_id, texto, lida) VALUES
  (1, 2, 'Ola, a mesa ainda esta disponivel?', 1),
  (1, 1, 'Sim, ainda esta disponivel para retirada.', 0);
