# Reusa Sarandi

Plataforma web para intermediar doacoes de moveis, objetos reutilizaveis e outros itens no municipio de Sarandi/PR.

O objetivo social do Reusa Sarandi e reduzir descarte irregular, estimular o reaproveitamento de bens ainda uteis e aproximar doadores de pessoas ou entidades que possam dar novo uso a esses itens.

Repositorio GitHub: [https://github.com/jmz0/reusa-sarandi](https://github.com/jmz0/reusa-sarandi)

## Tecnologias

Frontend:

- React
- TypeScript
- Vite
- TailwindCSS
- React Router DOM

Backend:

- Node.js
- Express
- SQLite
- `sqlite` e `sqlite3`
- Multer para upload local de imagens
- CORS

## Estrutura do projeto

```text
reusa-sarandi/
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
    README.md
    package.json
  public/
  src/
    components/
    context/
    pages/
    services/
    types/
  package.json
  README.md
```

## Arquitetura

O projeto esta organizado em frontend React e backend Express.

O frontend consome a API HTTP do backend para autenticacao, listagem e cadastro de itens, upload de imagens, alteracao de status, remocao de itens, fluxo de interesse, Caixa de Entrada, threads e mensagens.

O backend usa SQLite como banco local. As imagens enviadas no cadastro de itens sao salvas em `backend/uploads`, e seus metadados ficam persistidos no banco.

O `localStorage` e usado apenas para armazenar a sessao do usuario autenticado atual no navegador. Usuarios, itens, conversas e mensagens nao usam `localStorage` como banco principal.

A Caixa de Entrada usa polling simples para atualizar conversas, mensagens e contador de nao lidas. Nao ha WebSocket nesta versao.

## Funcionalidades implementadas

- Cadastro de usuarios
- Login simples
- Sessao local do usuario autenticado atual
- Cadastro de itens para doacao
- Upload local de imagens dos itens
- Listagem, busca e filtros de itens
- Visualizacao de detalhes do item
- Alteracao de status do item
- Remocao de itens cadastrados pelo usuario
- Fluxo "Tenho interesse"
- Criacao e reutilizacao de threads entre doador e interessado
- Envio e leitura de mensagens
- Caixa de Entrada integrada ao backend
- Contador de mensagens nao lidas
- Atualizacao periodica simples da Caixa de Entrada por polling
- Feedback visual interno para mensagens de sucesso e erro

## Instalar dependencias do frontend

Na raiz do projeto:

```bash
npm install
```

## Instalar dependencias do backend

```bash
cd backend
npm install
```

## Inicializar o banco

Na pasta `backend/`:

```bash
npm run init-db
```

Esse comando cria/recria o banco SQLite local em `backend/database/reusa-sarandi.sqlite`, aplica o schema e insere dados iniciais.

## Rodar o backend

Na pasta `backend/`:

```bash
npm run dev
```

Ou:

```bash
npm start
```

O backend roda na porta `3001` e escuta em `0.0.0.0`.

## Rodar o frontend

Na raiz do projeto:

```bash
npm run dev
```

Por padrao, o frontend usa `http://localhost:3001` como URL da API. Para apontar para outro endereco, configure `VITE_API_URL`.

Exemplo:

```bash
VITE_API_URL=http://localhost:3001 npm run dev
```

No PowerShell:

```powershell
$env:VITE_API_URL="http://localhost:3001"
npm run dev
```

## Acesso por outros dispositivos na mesma rede

Para testar em outro computador ou celular na mesma rede:

1. Rode o backend ouvindo em `0.0.0.0`:

```bash
cd backend
npm run dev
```

2. Rode o frontend expondo o Vite na rede:

```bash
npm run dev -- --host 0.0.0.0
```

3. Configure o frontend para acessar o backend pelo IP da maquina servidora:

```powershell
$env:VITE_API_URL="http://SEU-IP-LOCAL:3001"
npm run dev -- --host 0.0.0.0
```

4. Acesse o endereco mostrado pelo Vite usando o IP da maquina na rede.

## Limitacoes atuais

- Autenticacao simples, sem JWT.
- Senhas sao armazenadas sem hash, apenas para fins academicos/prototipacao.
- SQLite e usado como banco local.
- Upload de imagens e local, em `backend/uploads`.
- Nao ha upload em nuvem.
- Nao ha WebSocket.
- A Caixa de Entrada usa polling simples.
- Nao ha notificacoes push.
- Nao ha deploy configurado nesta etapa.
