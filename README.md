# # Reusa Sarandi

Plataforma web para intermediação de doações de móveis e objetos reutilizáveis no município de Sarandi/PR, com foco na redução do descarte irregular e incentivo à economia circular.

---

## Tecnologias utilizadas:

- React;
- TypeScript;
- TailwindCSS;
- React Router DOM;
- LocalStorage (simulação de backend);

---

##  Funcionalidades:

- Cadastro de usuários;
- Login e autenticação;
- Cadastro de itens com imagens;
- Filtros e busca de itens;
- Sistema de interesse em itens;
- Chat entre doador e receptor;
- Caixa de entrada com mensagens;
- Controle de status do item (disponível, em negociação, doado);
- Perfil de usuário com foto;
- Modo administrador (visualização).

---

##  Arquitetura:

A aplicação foi desenvolvida como Single Page Application, com separação em:

- Pages (interfaces);
- Context (autenticação);
- Types (modelos de dados);
- Componentes reutilizáveis;

Persistência realizada via LocalStorage para simulação de backend (nível protótipo): esta versão utiliza armazenamento local e não possui backend real. A estrutura foi projetada para futura integração com APIs e banco de dados.  
---

## Como executar

```bash
npm install
npm run dev
