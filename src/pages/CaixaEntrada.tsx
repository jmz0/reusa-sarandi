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
  onEnviarMensagem: (threadId: number, fromUserId: number, body: string) => void;
  onMarcarMensagensComoLidas: (
    threadId: number,
    destinatarioId: number
  ) => void;
};

export default function CaixaEntrada({
  threads,
  mensagens,
  itens,
  onEnviarMensagem,
  onMarcarMensagensComoLidas,
}: CaixaEntradaProps) {
  const { usuario, obterUsuarioPorId } = useAuth();
  const [threadSelecionadaId, setThreadSelecionadaId] =
    useState<number | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");

  if (!usuario) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Caixa de Entrada</h1>
        <p className="mt-3 text-gray-700">
          É necessário estar autenticado para visualizar suas conversas.
        </p>
      </section>
    );
  }

  const usuarioId = usuario.id;

  // Threads em que o usuário participa
  const minhasThreads = threads.filter(
    (t) => t.donorId === usuarioId || t.receiverId === usuarioId
  );

  // Enriquecer com nome do outro usuário, título do item e contagem de não lidas
  const threadsComInfo: ThreadComInfo[] = minhasThreads.map((t) => {
    const outroUsuarioId = t.donorId === usuarioId ? t.receiverId : t.donorId;

    const outroUsuario = obterUsuarioPorId(outroUsuarioId);
    const outroUsuarioNome = outroUsuario?.nome ?? `Usuário #${outroUsuarioId}`;

    const item = itens.find((i) => i.id === t.itemId);
    const itemTitulo = item ? item.titulo : `Item #${t.itemId}`;

    const naoLidas = mensagens.filter(
      (m) =>
        m.threadId === t.id &&
        m.toUserId === usuarioId &&
        !m.lidaPeloDestinatario
    ).length;

    return {
      ...t,
      outroUsuarioNome,
      itemTitulo,
      naoLidas,
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

  // Ao selecionar thread, marcar mensagens recebidas como lidas
  useEffect(() => {
    if (!threadSelecionadaId) return;
    onMarcarMensagensComoLidas(threadSelecionadaId, usuarioId);
  }, [threadSelecionadaId, usuarioId, onMarcarMensagensComoLidas]);

  function handleSelecionarThread(id: number) {
    setThreadSelecionadaId(id);
  }

  function handleEnviarMensagem() {
    if (!threadSelecionada || !novaMensagem.trim()) return;

    const texto = novaMensagem.trim();
    onEnviarMensagem(threadSelecionada.id, usuarioId, texto);
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
        Aqui são exibidas as conversas entre doadores e receptores. Nesta versão,
        as mensagens são armazenadas localmente no seu navegador, apenas para fins
        de demonstração do fluxo da plataforma.
      </p>

      {threadsComInfo.length === 0 ? (
        <p className="text-gray-600">
          Você ainda não possui conversas. Demonstre interesse em um item para
          iniciar uma troca de mensagens com o doador.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          {/* Lista de conversas */}
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

          {/* Área de mensagens */}
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
                    Qualquer dado de contato (telefone, e-mail, endereço) é
                    compartilhado diretamente pelo doador nas mensagens, a critério
                    dele.
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
                  {mensagensDaThreadSelecionada.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Nenhuma mensagem nesta conversa ainda.
                    </p>
                  ) : (
                    mensagensDaThreadSelecionada.map((m) => {
                      // receptor = quem demonstrou interesse
                      const ehDoReceptor =
                        m.fromUserId === threadSelecionada.receiverId;

                      return (
                        <div
                          key={m.id}
                          className={`flex ${
                            ehDoReceptor ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={
                              "max-w-[75%] rounded-lg px-3 py-2 " +
                              (ehDoReceptor
                                ? "bg-gray-200 text-gray-900" // receptor: direita, cinza
                                : "bg-green-600 text-white") // doador: esquerda, verde
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
