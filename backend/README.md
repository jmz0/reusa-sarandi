# Backend Reusa Sarandi

Implementacao inicial do backend do Modulo 3. O frontend React da raiz do projeto nao foi alterado.

## Tecnologias

- Node.js
- Express
- SQLite com `sqlite` e `sqlite3`
- Multer para upload local de imagens
- CORS habilitado para testes locais

## Instalar

```bash
cd backend
npm install
```

## Inicializar o banco

```bash
npm run init-db
```

Esse comando cria `database/reusa-sarandi.sqlite`, aplica `database/schema.sql` e popula dados iniciais de `database/seed.sql`.

## Executar

Modo desenvolvimento:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

O servidor roda em `http://localhost:3001` e escuta em `0.0.0.0`, permitindo testes por outros dispositivos na mesma rede usando o IP da maquina.

## Uploads

As imagens enviadas por `POST /api/itens/:id/imagens` sao salvas em:

```text
backend/uploads
```

O banco salva caminho publico, nome do arquivo, nome original, MIME type, tamanho em bytes e indicador de imagem principal. Os arquivos ficam acessiveis por `/uploads/nome-do-arquivo`.

## Endpoints

### Saude

- `GET /api/health`

### Auth e usuarios

- `POST /api/auth/cadastro`
- `POST /api/auth/login`
- `GET /api/usuarios/:id`

Exemplo de cadastro:

```json
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "senha": "1234",
  "telefone": "(44) 99999-1234",
  "bairro": "Centro"
}
```

Exemplo de login:

```json
{
  "email": "ana@reusa.local",
  "senha": "1234"
}
```

### Itens

- `GET /api/itens`
- `GET /api/itens?status=disponivel`
- `GET /api/itens?categoria=moveis`
- `GET /api/itens/:id`
- `POST /api/itens`
- `PATCH /api/itens/:id/status`
- `DELETE /api/itens/:id`
- `POST /api/itens/:id/imagens`
- `GET /api/itens/:id/imagens`

Exemplo de criacao de item:

```json
{
  "doadorId": 1,
  "titulo": "Armario pequeno",
  "descricao": "Armario usado em bom estado.",
  "categoria": "moveis",
  "estadoConservacao": "bom",
  "localizacao": "Centro"
}
```

Status aceitos:

```text
disponivel, reservado, doado, cancelado
```

Estados de conservacao aceitos:

```text
novo, bom, usado, precisa_reparo
```

Upload com `curl`:

```bash
curl -X POST http://localhost:3001/api/itens/1/imagens \
  -F "imagens=@/caminho/para/imagem.jpg"
```

### Threads e mensagens

- `GET /api/threads/usuario/:usuarioId`
- `POST /api/threads`
- `GET /api/mensagens/thread/:threadId?usuarioId=`
- `POST /api/mensagens`
- `PATCH /api/mensagens/thread/:threadId/lidas`

Exemplo de criacao de thread:

```json
{
  "itemId": 1,
  "interessadoId": 2
}
```

Exemplo de mensagem:

```json
{
  "threadId": 1,
  "remetenteId": 2,
  "texto": "Ainda esta disponivel?"
}
```

Exemplo para marcar mensagens como lidas:

```json
{
  "usuarioId": 1
}
```

## Observacoes

- JWT nao foi implementado nesta etapa.
- Hash de senha nao foi implementado nesta etapa.
- WebSocket nao foi implementado nesta etapa.
- Upload em nuvem nao foi implementado nesta etapa.
