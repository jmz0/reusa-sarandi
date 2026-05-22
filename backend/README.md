# Backend Reusa Sarandi

Backend do Modulo 3 do projeto Reusa Sarandi.

O objetivo deste backend e fornecer uma API simples para o frontend React, com persistencia em SQLite, modelagem relacional, autenticacao basica, gerenciamento de itens, upload local de imagens, fluxo de interesse, threads e mensagens.

## Tecnologias

- Node.js
- Express
- SQLite
- `sqlite`
- `sqlite3`
- Multer
- CORS

## Estrutura da pasta `backend`

```text
backend/
  database/
    schema.sql
    seed.sql
    queries.sql
  src/
    db.js
    server.js
    routes/
      auth.js
      itens.js
      mensagens.js
  uploads/
    .gitkeep
  package.json
  README.md
```

## Arquivos SQL

- `database/schema.sql`: define as tabelas, chaves primarias, chaves estrangeiras, constraints, checks, defaults e indices.
- `database/seed.sql`: insere dados iniciais para facilitar testes locais.
- `database/queries.sql`: registra consultas SQL principais como referencia de modelagem e manutencao.

O banco local gerado pelo projeto fica em:

```text
backend/database/reusa-sarandi.sqlite
```

## Instalar dependencias

```bash
cd backend
npm install
```

## Inicializar o banco

```bash
npm run init-db
```

Esse comando aplica `schema.sql` e `seed.sql`. Como o schema derruba e recria as tabelas, use esse comando com cuidado quando houver dados de teste que voce queira preservar.

## Rodar o servidor

Modo desenvolvimento:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

O servidor roda em:

```text
http://localhost:3001
```

Ele escuta em `0.0.0.0`, permitindo testes por outros dispositivos na mesma rede quando o firewall e a rede permitirem.

## Upload local de imagens

As imagens enviadas por `POST /api/itens/:id/imagens` sao salvas localmente em:

```text
backend/uploads
```

O banco salva metadados da imagem, incluindo caminho publico, nome do arquivo, nome original, MIME type, tamanho, rotacao e indicador de imagem principal.

Os arquivos ficam disponiveis publicamente pelo backend em:

```text
/uploads/nome-do-arquivo
```

## Endpoints principais

### Saude

- `GET /api/health`

### Autenticacao e usuarios

- `POST /api/auth/cadastro`
- `POST /api/auth/login`
- `GET /api/usuarios/:id`

### Itens

- `GET /api/itens`
- `GET /api/itens/:id`
- `POST /api/itens`
- `PATCH /api/itens/:id/status`
- `DELETE /api/itens/:id`
- `POST /api/itens/:id/imagens`
- `GET /api/itens/:id/imagens`

### Threads e mensagens

- `GET /api/threads/usuario/:usuarioId`
- `POST /api/threads`
- `GET /api/mensagens/thread/:threadId?usuarioId=`
- `POST /api/mensagens`
- `PATCH /api/mensagens/thread/:threadId/lidas`

## Exemplos de requisicoes

### Cadastro de usuario

```bash
curl -X POST http://localhost:3001/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Maria Silva\",\"email\":\"maria@example.com\",\"senha\":\"1234\"}"
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ana@reusa.local\",\"senha\":\"1234\"}"
```

### Listar itens

```bash
curl http://localhost:3001/api/itens
```

### Criar item

```bash
curl -X POST http://localhost:3001/api/itens \
  -H "Content-Type: application/json" \
  -d "{\"doadorId\":1,\"titulo\":\"Armario pequeno\",\"descricao\":\"Armario usado em bom estado.\",\"categoria\":\"moveis\",\"estadoConservacao\":\"bom\",\"localizacao\":\"Centro\"}"
```

### Atualizar status de item

```bash
curl -X PATCH http://localhost:3001/api/itens/1/status \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"reservado\"}"
```

Status aceitos pelo backend:

```text
disponivel, reservado, doado, cancelado
```

Estados de conservacao aceitos pelo backend:

```text
novo, bom, usado, precisa_reparo
```

### Upload de imagens de item

```bash
curl -X POST http://localhost:3001/api/itens/1/imagens \
  -F "imagens=@/caminho/para/imagem.jpg" \
  -F "rotationDeg=0"
```

### Criar ou reutilizar thread

```bash
curl -X POST http://localhost:3001/api/threads \
  -H "Content-Type: application/json" \
  -d "{\"itemId\":1,\"interessadoId\":2}"
```

### Listar threads de um usuario

```bash
curl http://localhost:3001/api/threads/usuario/1
```

### Enviar mensagem

```bash
curl -X POST http://localhost:3001/api/mensagens \
  -H "Content-Type: application/json" \
  -d "{\"threadId\":1,\"remetenteId\":2,\"texto\":\"Ainda esta disponivel?\"}"
```

### Listar mensagens de uma thread

```bash
curl "http://localhost:3001/api/mensagens/thread/1?usuarioId=1"
```

O backend verifica se o usuario informado participa da thread.

### Marcar mensagens como lidas

```bash
curl -X PATCH http://localhost:3001/api/mensagens/thread/1/lidas \
  -H "Content-Type: application/json" \
  -d "{\"usuarioId\":1}"
```

## Observacoes importantes

- A autenticacao e simples, sem JWT.
- Senhas nao usam hash nesta etapa.
- SQLite e usado como banco local para fins academicos e de prototipacao.
- O upload de imagens e local; nao ha upload em nuvem.
- Nao ha WebSocket; o frontend usa polling simples para Caixa de Entrada e mensagens nao lidas.
- O `localStorage` pertence ao frontend e deve ser usado apenas para a sessao do usuario autenticado atual.

## Teste em outros dispositivos na mesma rede

Para acessar de outro dispositivo:

1. Rode o backend escutando em `0.0.0.0`:

```bash
cd backend
npm run dev
```

2. Rode o frontend com Vite tambem exposto na rede:

```bash
npm run dev -- --host 0.0.0.0
```

3. Configure o frontend com o IP da maquina que esta rodando o backend:

```powershell
$env:VITE_API_URL="http://SEU-IP-LOCAL:3001"
npm run dev -- --host 0.0.0.0
```

Use o endereco mostrado pelo Vite no outro dispositivo. O backend e o frontend precisam estar acessiveis pela rede local.
