PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS mensagens;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS imagens_item;
DROP TABLE IF EXISTS itens_doacao;
DROP TABLE IF EXISTS perfis_usuario;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE CHECK (instr(email, '@') > 1),
  senha TEXT NOT NULL CHECK (length(senha) >= 4),
  telefone TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perfis_usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'pessoa_fisica'
    CHECK (tipo IN ('pessoa_fisica', 'entidade', 'administrador')),
  bairro TEXT,
  cidade TEXT NOT NULL DEFAULT 'Sarandi',
  uf TEXT NOT NULL DEFAULT 'PR' CHECK (length(uf) = 2),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE itens_doacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doador_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'geral',
  estado_conservacao TEXT NOT NULL DEFAULT 'bom'
    CHECK (estado_conservacao IN ('novo', 'bom', 'usado', 'precisa_reparo')),
  status TEXT NOT NULL DEFAULT 'disponivel'
    CHECK (status IN ('disponivel', 'reservado', 'doado', 'cancelado')),
  localizacao TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE imagens_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  caminho TEXT NOT NULL UNIQUE,
  nome_arquivo TEXT NOT NULL UNIQUE,
  nome_original TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type LIKE 'image/%'),
  tamanho_bytes INTEGER NOT NULL CHECK (tamanho_bytes > 0),
  rotation_deg INTEGER NOT NULL DEFAULT 0 CHECK (rotation_deg IN (0, 90, 180, 270)),
  principal INTEGER NOT NULL DEFAULT 0 CHECK (principal IN (0, 1)),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES itens_doacao(id) ON DELETE CASCADE
);

CREATE TABLE threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  doador_id INTEGER NOT NULL,
  interessado_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'arquivada')),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (item_id, doador_id, interessado_id),
  CHECK (doador_id <> interessado_id),
  FOREIGN KEY (item_id) REFERENCES itens_doacao(id) ON DELETE CASCADE,
  FOREIGN KEY (doador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (interessado_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL,
  remetente_id INTEGER NOT NULL,
  texto TEXT NOT NULL CHECK (length(trim(texto)) > 0),
  lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0, 1)),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
  FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_itens_status ON itens_doacao(status);
CREATE INDEX idx_itens_doador ON itens_doacao(doador_id);
CREATE INDEX idx_imagens_item ON imagens_item(item_id);
CREATE INDEX idx_threads_doador ON threads(doador_id);
CREATE INDEX idx_threads_interessado ON threads(interessado_id);
CREATE INDEX idx_mensagens_thread ON mensagens(thread_id);
