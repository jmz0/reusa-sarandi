import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
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
import type { ItemDoacao } from "./types/ItemDoacao";
import type { Thread, Mensagem } from "./types/Mensagem";
import ItemDetalhe from "./pages/ItemDetalhe";
import MeuPerfil from "./pages/MeuPerfil";
import {
  atualizarStatusItem,
  criarOuReutilizarThread,
  criarItem,
  enviarMensagemThread,
  enviarImagensItem,
  listarMensagensThread,
  listarItens,
  listarThreadsUsuario,
  marcarMensagensThreadLidas,
  removerItem,
} from "./services/api";

type NovoItemInput = {
  titulo: string;
  descricao: string;
  categoria: string;
  bairro: string;
  estadoConservacao: ItemDoacao["estadoConservacao"];
  imagens: { file?: File; url: string; rotationDeg?: number }[];
};

export default function App() {
  const { usuario, sair } = useAuth();
  const [itens, setItens] = useState<ItemDoacao[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  const carregarItens = useCallback(async () => {
    try {
      const itensApi = await listarItens();
      setItens(itensApi);
    } catch (error) {
      console.error("Nao foi possivel carregar os itens.", error);
    }
  }, []);

  const carregarThreads = useCallback(async () => {
    if (!usuario) {
      setThreads([]);
      setMensagens([]);
      return;
    }

    try {
      const threadsApi = await listarThreadsUsuario(usuario.id);
      setThreads(threadsApi);
    } catch (error) {
      console.error("Nao foi possivel carregar as conversas.", error);
    }
  }, [usuario]);

  useEffect(() => {
    void carregarItens();
  }, [carregarItens]);

  useEffect(() => {
    void carregarThreads();
  }, [carregarThreads]);

  const mensagensNaoLidas = usuario
    ? threads.reduce((total, thread) => total + (thread.naoLidas ?? 0), 0)
    : 0;

  const navLinkClass =
    "px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors";

  async function handleAdicionarItem(dados: NovoItemInput) {
    if (!usuario) {
      alert("Voce precisa estar logado para cadastrar um item.");
      return;
    }

    const itemCriado = await criarItem({
      doadorId: usuario.id,
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      bairro: dados.bairro,
      estadoConservacao: dados.estadoConservacao,
    });

    const imagensParaUpload = dados.imagens
      .filter((imagem): imagem is { file: File; url: string; rotationDeg?: number } =>
        imagem.file instanceof File
      )
      .map((imagem) => ({
        file: imagem.file,
        rotationDeg: imagem.rotationDeg,
      }));

    if (imagensParaUpload.length === 0) {
      throw new Error("Envie pelo menos uma imagem valida.");
    }

    await enviarImagensItem(itemCriado.id, imagensParaUpload);

    await carregarItens();
  }

  async function handleIniciarInteresse(itemId: number, mensagemTexto: string) {
    if (!usuario) {
      alert("Voce precisa estar logado para manifestar interesse.");
      return;
    }

    const item = itens.find((i) => i.id === itemId);
    if (!item) {
      alert("Item invalido para interesse.");
      return;
    }

    if (item.status === "doado") {
      alert("Este item ja foi doado e nao aceita novos interesses.");
      return;
    }

    try {
      const thread = await criarOuReutilizarThread(itemId, usuario.id);
      await enviarMensagemThread(thread, usuario.id, mensagemTexto);

      if (item.status === "disponivel") {
        await atualizarStatusItem(itemId, "em-negociacao");
      }

      await Promise.all([carregarItens(), carregarThreads()]);

      alert(
        "Sua mensagem foi enviada ao doador. Ele podera visualizar pela Caixa de Entrada."
      );
    } catch (error: any) {
      alert(error.message ?? "Nao foi possivel registrar o interesse.");
    }
  }

  async function handleAtualizarStatusItem(
    itemId: number,
    novoStatus: ItemDoacao["status"]
  ) {
    try {
      await atualizarStatusItem(itemId, novoStatus);
      await carregarItens();
    } catch (error: any) {
      alert(error.message ?? "Nao foi possivel atualizar o status.");
    }
  }

  async function handleRemoverItem(itemId: number) {
    try {
      await removerItem(itemId);
      await carregarItens();
    } catch (error: any) {
      alert(error.message ?? "Nao foi possivel remover o item.");
    }
  }

  async function handleCarregarMensagensThread(threadId: number) {
    if (!usuario) return;

    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    try {
      const mensagensApi = await listarMensagensThread(thread, usuario.id);
      setMensagens((atuais) => [
        ...atuais.filter((mensagem) => mensagem.threadId !== threadId),
        ...mensagensApi,
      ]);
    } catch (error: any) {
      alert(error.message ?? "Nao foi possivel carregar as mensagens.");
    }
  }

  async function handleEnviarMensagemNaThread(
    threadId: number,
    fromUserId: number,
    body: string
  ) {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    try {
      await enviarMensagemThread(thread, fromUserId, body);
      await handleCarregarMensagensThread(threadId);
      await carregarThreads();
    } catch (error: any) {
      alert(error.message ?? "Nao foi possivel enviar a mensagem.");
    }
  }

  async function handleMarcarMensagensComoLidas(
    threadId: number,
    destinatarioId: number
  ) {
    try {
      await marcarMensagensThreadLidas(threadId, destinatarioId);
      await handleCarregarMensagensThread(threadId);
      await carregarThreads();
    } catch (error: any) {
      alert(error.message ?? "Nao foi possivel marcar mensagens como lidas.");
    }
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_#dbeafe_0,_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#ffffff_45%,_#eff6ff_100%)] text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-sm">
          <nav
            className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4"
            aria-label="Navegacao principal"
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
                    Ola, <strong>{usuario.nome}</strong>
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
                    onCarregarMensagens={handleCarregarMensagensThread}
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
            <span>&copy; {new Date().getFullYear()} Reusa Sarandi</span>
            <span>Plataforma de doacoes e reaproveitamento em Sarandi/PR</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
