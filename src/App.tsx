import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Itens from "./pages/Itens";
import CadastrarItem from "./pages/CadastrarItem";
import Sobre from "./pages/Sobre";
import MeusItens from "./pages/MeusItens";
import Login from "./pages/Login";
import CadastroUsuario from "./pages/CadastroUsuario";
import CaixaEntrada from "./pages/CaixaEntrada";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";
import type { ItemDoacao } from "./types/ItemDoacao";
import type { Thread, Mensagem } from "./types/Mensagem";
import ItemDetalhe from "./pages/ItemDetalhe";
import MeuPerfil from "./pages/MeuPerfil";

// Dados do formulário (sem id, status, criadoPorUsuario)
type NovoItemInput = {
  titulo: string;
  descricao: string;
  categoria: string;
  bairro: string;
  estadoConservacao: ItemDoacao["estadoConservacao"];
  imagens?: ItemDoacao["imagens"];
};

const ITENS_KEY = "reusa_sarandi_itens";
const THREADS_KEY = "reusa_sarandi_threads";
const MENSAGENS_KEY = "reusa_sarandi_mensagens";

// Itens iniciais (mock)
const ITENS_INICIAIS: ItemDoacao[] = [
  {
    id: 1,
    titulo: "Guarda-roupa 4 portas",
    descricao:
      "Guarda-roupa em MDF, usado, com pequenas marcas de uso. Necessita apenas de reaperto das dobradiças.",
    categoria: "Móveis",
    bairro: "Jardim São José",
    estadoConservacao: "bom",
    status: "disponivel",
    criadoPorUsuario: false,
    ownerId: 0,
  },
  {
    id: 2,
    titulo: "Conjunto de cadeiras de plástico",
    descricao:
      "4 cadeiras plásticas, algumas com desbotamento pelo sol, mas ainda firmes e utilizáveis.",
    categoria: "Móveis",
    bairro: "Jardim Panorama",
    estadoConservacao: "regular",
    status: "disponivel",
    criadoPorUsuario: false,
    ownerId: 0,
  },
  {
    id: 3,
    titulo: "Berço desmontável",
    descricao:
      "Berço desmontável com colchão. Um zíper do bolso lateral está com defeito, demais partes em bom estado.",
    categoria: "Infantil",
    bairro: "Nova Independência I",
    estadoConservacao: "bom",
    status: "em-negociacao",
    criadoPorUsuario: false,
    ownerId: 0,
  },
];

export default function App() {
  const { usuario, sair } = useAuth();

  const [itens, setItens] = useState<ItemDoacao[]>(() => {
    if (typeof window === "undefined") return ITENS_INICIAIS;

    try {
      const salvo = window.localStorage.getItem(ITENS_KEY);
      if (!salvo) return ITENS_INICIAIS;

      const parsed = JSON.parse(salvo) as ItemDoacao[];
      if (!Array.isArray(parsed)) return ITENS_INICIAIS;
      return parsed;
    } catch {
      return ITENS_INICIAIS;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(ITENS_KEY, JSON.stringify(itens));
    } catch {
      // em aplicação real, registrar erro
    }
  }, [itens]);

  const [threads, setThreads] = useState<Thread[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const salvo = window.localStorage.getItem(THREADS_KEY);
      if (!salvo) return [];
      const parsed = JSON.parse(salvo);
      if (!Array.isArray(parsed)) return [];
      return parsed as Thread[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    } catch {
      // logar erro em app real
    }
  }, [threads]);

  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const salvo = window.localStorage.getItem(MENSAGENS_KEY);
      if (!salvo) return [];
      const parsed = JSON.parse(salvo);
      if (!Array.isArray(parsed)) return [];
      return parsed as Mensagem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(MENSAGENS_KEY, JSON.stringify(mensagens));
    } catch {
      // logar erro em app real
    }
  }, [mensagens]);

  const mensagensNaoLidas = usuario
    ? mensagens.filter(
        (m) => m.toUserId === usuario.id && !m.lidaPeloDestinatario
      ).length
    : 0;

  const navLinkClass =
    "px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors";

  function handleAdicionarItem(dados: NovoItemInput) {
    if (!usuario) {
      alert("Você precisa estar logado para cadastrar um item.");
      return;
    }

    setItens((atual) => {
      const novoId =
        atual.length > 0 ? Math.max(...atual.map((i) => i.id)) + 1 : 1;

      const novoItem: ItemDoacao = {
        id: novoId,
        status: "disponivel",
        criadoPorUsuario: true,
        ownerId: usuario.id,
        ...dados,
      };

      return [...atual, novoItem];
    });
  }

  function handleIniciarInteresse(itemId: number, mensagemTexto: string) {
    if (!usuario) {
      alert("Você precisa estar logado para manifestar interesse.");
      return;
    }

    const item = itens.find((i) => i.id === itemId);
    if (!item) {
      alert("Item inválido para interesse.");
      return;
    }

    if (item.status === "doado") {
      alert("Este item já foi doado e não aceita novos interesses.");
      return;
    }

    const donorId = item.ownerId ?? 0;
    const receiverId = usuario.id;
    const agora = new Date().toISOString();

    let threadExistente = threads.find(
      (t) =>
        t.itemId === itemId &&
        t.donorId === donorId &&
        t.receiverId === receiverId &&
        t.status === "aberta"
    );

    let threadId: number;

    if (!threadExistente) {
      const novoId =
        threads.length > 0 ? Math.max(...threads.map((t) => t.id)) + 1 : 1;

      const novaThread: Thread = {
        id: novoId,
        itemId,
        donorId,
        receiverId,
        createdAt: agora,
        lastUpdatedAt: agora,
        status: "aberta",
      };

      setThreads((atual) => [...atual, novaThread]);
      threadId = novoId;
      threadExistente = novaThread;
    } else {
      threadId = threadExistente.id;
      setThreads((atual) =>
        atual.map((t) =>
          t.id === threadId ? { ...t, lastUpdatedAt: agora } : t
        )
      );
    }

    setMensagens((atual) => {
      const novoId =
        atual.length > 0 ? Math.max(...atual.map((m) => m.id)) + 1 : 1;

      const novaMensagem: Mensagem = {
        id: novoId,
        threadId,
        fromUserId: receiverId,
        toUserId: donorId,
        body: mensagemTexto,
        createdAt: agora,
        lidaPeloDestinatario: false,
      };

      return [...atual, novaMensagem];
    });

    setItens((atual) =>
      atual.map((i) =>
        i.id === itemId && i.status === "disponivel"
          ? { ...i, status: "em-negociacao" }
          : i
      )
    );

    alert(
      "Sua mensagem foi enviada ao doador. Ele poderá visualizar pela Caixa de Entrada."
    );
  }

  function handleAtualizarStatusItem(
    itemId: number,
    novoStatus: ItemDoacao["status"]
  ) {
    setItens((atual) =>
      atual.map((i) =>
        i.id === itemId
          ? {
              ...i,
              status: novoStatus,
            }
          : i
      )
    );
  }

  function handleRemoverItem(itemId: number) {
    setItens((atual) => atual.filter((i) => i.id !== itemId));
  }

  function handleEnviarMensagemNaThread(
    threadId: number,
    fromUserId: number,
    body: string
  ) {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    const agora = new Date().toISOString();

    const toUserId =
      fromUserId === thread.donorId ? thread.receiverId : thread.donorId;

    setMensagens((atual) => {
      const novoId =
        atual.length > 0 ? Math.max(...atual.map((m) => m.id)) + 1 : 1;

      const novaMensagem: Mensagem = {
        id: novoId,
        threadId,
        fromUserId,
        toUserId,
        body,
        createdAt: agora,
        lidaPeloDestinatario: false,
      };

      return [...atual, novaMensagem];
    });

    setThreads((atual) =>
      atual.map((t) =>
        t.id === threadId ? { ...t, lastUpdatedAt: agora } : t
      )
    );
  }

  function handleMarcarMensagensComoLidas(
    threadId: number,
    destinatarioId: number
  ) {
    setMensagens((atual) => {
      let alterou = false;
      const atualizado = atual.map((m) => {
        if (
          m.threadId === threadId &&
          m.toUserId === destinatarioId &&
          !m.lidaPeloDestinatario
        ) {
          alterou = true;
          return { ...m, lidaPeloDestinatario: true };
        }
        return m;
      });
      return alterou ? atualizado : atual;
    });
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_#dbeafe_0,_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#ffffff_45%,_#eff6ff_100%)] text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-sm">
          <nav
            className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4"
            aria-label="Navegação principal"
          >
            <Link
              to="/"
              className="group flex items-center gap-3 text-xl font-bold text-blue-700"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm group-hover:scale-105 transition-transform">
                R
              </span>
              <span className="tracking-tight">Reusa Sarandi</span>
            </Link>

            <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2 items-center">
              <Link to="/itens" className={navLinkClass}>
                Itens
              </Link>
              <Link to="/cadastrar" className={navLinkClass}>
                Cadastrar item
              </Link>
              <Link to="/meus-itens" className={navLinkClass}>
                Meus itens
              </Link>

              {usuario && (
                <Link to="/meu-perfil" className={navLinkClass}>
                  Meu perfil
                </Link>
              )}

              <Link to="/caixa-entrada" className={`${navLinkClass} relative`}>
                Caixa de entrada
                {mensagensNaoLidas > 0 && (
                  <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {mensagensNaoLidas}
                  </span>
                )}
              </Link>

              <Link to="/sobre" className={navLinkClass}>
                Sobre
              </Link>

              {usuario ? (
                <div className="ml-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1">
                  <span className="hidden sm:inline text-xs text-slate-600">
                    Olá, <strong>{usuario.nome}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={sair}
                    className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-1 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        </header>

        <main
          id="conteudo-principal"
          className="flex-1 max-w-6xl mx-auto w-full px-4 py-8"
        >
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/itens"
              element={
                <Itens
                  itens={itens}
                  onIniciarInteresse={handleIniciarInteresse}
                />
              }
            />

            <Route
              path="/itens/:id"
              element={
                <ItemDetalhe
                  itens={itens}
                  onIniciarInteresse={handleIniciarInteresse}
                />
              }
            />

            <Route
              path="/cadastrar"
              element={
                <PrivateRoute>
                  <CadastrarItem onAdicionarItem={handleAdicionarItem} />
                </PrivateRoute>
              }
            />

            <Route
              path="/meus-itens"
              element={
                <PrivateRoute>
                  <MeusItens
                    itens={itens}
                    onAtualizarStatus={handleAtualizarStatusItem}
                    onRemover={handleRemoverItem}
                  />
                </PrivateRoute>
              }
            />

            <Route
              path="/caixa-entrada"
              element={
                <PrivateRoute>
                  <CaixaEntrada
                    threads={threads}
                    mensagens={mensagens}
                    itens={itens}
                    onEnviarMensagem={handleEnviarMensagemNaThread}
                    onMarcarMensagensComoLidas={handleMarcarMensagensComoLidas}
                  />
                </PrivateRoute>
              }
            />

            <Route
              path="/meu-perfil"
              element={
                <PrivateRoute>
                  <MeuPerfil />
                </PrivateRoute>
              }
            />

            <Route path="/sobre" element={<Sobre />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
          </Routes>
        </main>

        <footer className="mt-8 border-t border-slate-200/80 bg-white/80">
          <div className="max-w-6xl mx-auto px-4 py-4 text-xs sm:text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Reusa Sarandi</span>
            <span>Plataforma de doações e reaproveitamento em Sarandi/PR</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
