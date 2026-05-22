import { useEffect, useState } from "react";
import type { Thread, Mensagem } from "../types/Mensagem";
import { useAuth } from "../context/AuthContext";
import type { ItemDoacao } from "../types/ItemDoacao";

type ThreadComInfo = Thread & {
  outroUsuarioNome: string;
  itemTitulo: string;
  naoLidas: number;
};

type CaixaEntradaProps = {
  threads: Thread[];
  mensagens: Mensagem[];
  itens: ItemDoacao[];
  onEnviarMensagem: (
    threadId: number,
    fromUserId: number,
    body: string
  ) => void | Promise<void>;
  onCarregarMensagens: (threadId: number) => void | Promise<void>;
  onAtualizarThreads: () => void | Promise<void>;
  onMarcarMensagensComoLidas: (
    threadId: number,
    destinatarioId: number
  ) => void | Promise<void>;
};

export default function CaixaEntrada({
  threads,
  mensagens,
  itens,
  onEnviarMensagem,
  onCarregarMensagens,
  onAtualizarThreads,
  onMarcarMensagensComoLidas,
}: CaixaEntradaProps) {
  const { usuario, obterUsuarioPorId } = useAuth();
  const [threadSelecionadaId, setThreadSelecionadaId] =
    useState<number | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");

  const usuarioId = usuario?.id;

  useEffect(() => {
    if (!threadSelecionadaId || !usuarioId) return;

    void (async () => {
      await onCarregarMensagens(threadSelecionadaId);
      await onMarcarMensagensComoLidas(threadSelecionadaId, usuarioId);
    })();
  }, [threadSelecionadaId, usuarioId]);

  useEffect(() => {
    if (!usuarioId) return;

    const intervalId = window.setInterval(() => {
      void onAtualizarThreads();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [usuarioId, onAtualizarThreads]);

  useEffect(() => {
    if (!threadSelecionadaId || !usuarioId) return;

    const intervalId = window.setInterval(() => {
      void (async () => {
        await onCarregarMensagens(threadSelecionadaId);
        await onMarcarMensagensComoLidas(threadSelecionadaId, usuarioId);
      })();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [
    threadSelecionadaId,
    usuarioId,
    onCarregarMensagens,
    onMarcarMensagensComoLidas,
  ]);

  if (!usuario || !usuarioId) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Caixa de Entrada</h1>
        <p className="mt-3 text-gray-700">
          E necessario estar autenticado para visualizar suas conversas.
        </p>
      </section>
    );
  }

  const minhasThreads = threads.filter(
    (t) => t.donorId === usuarioId || t.receiverId === usuarioId
  );

  const threadsComInfo: ThreadComInfo[] = minhasThreads.map((t) => {
    const outroUsuarioId = t.donorId === usuarioId ? t.receiverId : t.donorId;
    const outroUsuario = obterUsuarioPorId(outroUsuarioId);
    const outroUsuarioNome =
      t.donorId === usuarioId
        ? t.receiverNome ?? outroUsuario?.nome ?? `Usuario #${outroUsuarioId}`
        : t.donorNome ?? outroUsuario?.nome ?? `Usuario #${outroUsuarioId}`;

    const item = itens.find((i) => i.id === t.itemId);
    const itemTitulo = t.itemTitulo ?? item?.titulo ?? `Item #${t.itemId}`;

    return {
      ...t,
      outroUsuarioNome,
      itemTitulo,
      naoLidas: t.naoLidas ?? 0,
    };
  });

  const threadsOrdenadas = [...threadsComInfo].sort((a, b) =>
    b.lastUpdatedAt.localeCompare(a.lastUpdatedAt)
  );

  const threadSelecionada = threadsComInfo.find(
    (t) => t.id === threadSelecionadaId
  );

  const mensagensDaThreadSelecionada: Mensagem[] = threadSelecionada
    ? mensagens
        .filter((m) => m.threadId === threadSelecionada.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];

  function handleSelecionarThread(id: number) {
    setThreadSelecionadaId(id);
  }

  async function handleEnviarMensagem() {
    if (!threadSelecionada || !novaMensagem.trim() || !usuarioId) return;

    const texto = novaMensagem.trim();
    await onEnviarMensagem(threadSelecionada.id, usuarioId, texto);
    setNovaMensagem("");
  }

  return (
    <section
      aria-labelledby="caixa-titulo"
      className="max-w-6xl mx-auto w-full"
    >
      <h1
        id="caixa-titulo"
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
      >
        Caixa de Entrada
      </h1>

      <p className="text-sm text-gray-700 mb-4">
        Aqui sao exibidas as conversas entre doadores e receptores.
      </p>

      {threadsComInfo.length === 0 ? (
        <p className="text-gray-600">
          Voce ainda nao possui conversas. Demonstre interesse em um item para
          iniciar uma troca de mensagens com o doador.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <div className="border rounded-lg bg-white shadow-sm max-h-[480px] overflow-y-auto">
            {threadsOrdenadas.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelecionarThread(t.id)}
                className={
                  "w-full text-left px-3 py-2 border-b last:border-b-0 flex flex-col gap-1 hover:bg-gray-50 " +
                  (t.id === threadSelecionadaId ? "bg-blue-50" : "")
                }
              >
                <span className="text-sm font-semibold text-gray-900">
                  {t.outroUsuarioNome}
                </span>
                <span className="text-xs text-gray-600">{t.itemTitulo}</span>
                <span className="text-[10px] text-gray-500">
                  Iniciada em {new Date(t.createdAt).toLocaleString()}
                </span>
                {t.naoLidas > 0 && (
                  <span className="mt-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">
                    {t.naoLidas} nova(s) mensagem(ns)
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="border rounded-lg bg-white shadow-sm flex flex-col max-h-[480px]">
            {!threadSelecionada ? (
              <div className="p-4 text-gray-600 text-sm">
                Selecione uma conversa na lista ao lado para visualizar as
                mensagens.
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    Conversa com {threadSelecionada.outroUsuarioNome}
                  </span>
                  <span className="text-xs text-gray-600">
                    Sobre: {threadSelecionada.itemTitulo}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Qualquer dado de contato e compartilhado diretamente pelo
                    doador nas mensagens, a criterio dele.
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
                  {mensagensDaThreadSelecionada.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Nenhuma mensagem nesta conversa ainda.
                    </p>
                  ) : (
                    mensagensDaThreadSelecionada.map((m) => {
                      const ehMinha = m.fromUserId === usuarioId;

                      return (
                        <div
                          key={m.id}
                          className={`flex ${
                            ehMinha ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={
                              "max-w-[75%] rounded-lg px-3 py-2 " +
                              (ehMinha
                                ? "bg-gray-200 text-gray-900"
                                : "bg-green-600 text-white")
                            }
                          >
                            <p className="whitespace-pre-line">{m.body}</p>
                            <span className="block mt-1 text-[10px] opacity-70">
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t px-4 py-3 flex gap-2">
                  <textarea
                    className="flex-1 border rounded px-3 py-2 text-sm resize-none max-h-32"
                    rows={2}
                    placeholder="Digite sua mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleEnviarMensagem}
                    className="self-end px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                  >
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
