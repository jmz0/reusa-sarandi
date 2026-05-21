import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ItemDoacao } from "../types/ItemDoacao";
import { useAuth } from "../context/AuthContext";

type ItensProps = {
  itens: ItemDoacao[];
  onIniciarInteresse: (itemId: number, mensagem: string) => void | Promise<void>;
};

function labelEstado(estado: ItemDoacao["estadoConservacao"]): string {
  switch (estado) {
    case "novo":
      return "Novo";
    case "bom":
      return "Bom estado";
    case "regular":
      return "Uso regular";
    case "para-reparo":
      return "Necessita reparos";
  }
}

function labelStatus(status: ItemDoacao["status"]): string {
  switch (status) {
    case "disponivel":
      return "Disponível";
    case "em-negociacao":
      return "Em negociação";
    case "doado":
      return "Doado";
  }
}

type ItemCardProps = {
  item: ItemDoacao;
  onSolicitarInteresse: (item: ItemDoacao) => void;
};

function ItemCard({ item, onSolicitarInteresse }: ItemCardProps) {
  const [indiceImagem, setIndiceImagem] = useState(0);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const imagens = item.imagens ?? [];
  const temImagens = imagens.length > 0;
  const temMultiplas = imagens.length > 1;
  const imagemAtual = temImagens ? imagens[indiceImagem] : undefined;

  const isDoador = usuario && item.ownerId && item.ownerId === usuario.id;
  const isDoado = item.status === "doado";
  const podeClicar = !isDoador && !isDoado;

  function irParaAnterior() {
    if (!temMultiplas) return;
    setIndiceImagem((i) => (i === 0 ? imagens.length - 1 : i - 1));
  }

  function irParaProxima() {
    if (!temMultiplas) return;
    setIndiceImagem((i) => (i === imagens.length - 1 ? 0 : i + 1));
  }

  function irParaDetalhes() {
    navigate(`/itens/${item.id}`);
  }

  function handleClickInteresse() {
    // 1) Se o item já foi doado, bloqueia
    if (item.status === "doado") {
      alert("Este item já foi doado e não aceita novos interesses.");
      return;
    }

    // 2) Se o usuário é o dono do item, bloqueia
    if (usuario && item.ownerId && item.ownerId === usuario.id) {
      alert("Você é o doador deste item e não pode demonstrar interesse nele.");
      return;
    }

    // 3) Se não está logado, manda para login
    if (!usuario) {
      navigate("/login");
      return;
    }

    // 4) Abre modal no componente pai
    onSolicitarInteresse(item);
  }

  return (
    <article className="bg-white border rounded-lg shadow-sm p-4 flex flex-col h-full">
      {imagemAtual && (
        <div className="relative mb-3">
          <img
            src={imagemAtual.url}
            alt={item.titulo}
            style={{
              transform: `rotate(${imagemAtual.rotationDeg ?? 0}deg)`,
            }}
            className="w-full h-40 object-cover rounded"
          />

          {temMultiplas && (
            <>
              <div className="absolute inset-0 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={irParaAnterior}
                  className="bg-white/80 hover:bg-white rounded-full px-2 py-1 text-xs"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={irParaProxima}
                  className="bg-white/80 hover:bg-white rounded-full px-2 py-1 text-xs"
                >
                  ▶
                </button>
              </div>
              <span className="absolute bottom-1 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                {indiceImagem + 1}/{imagens.length}
              </span>
            </>
          )}
        </div>
      )}

      <header className="mb-2">
        <h2 className="text-lg font-semibold text-gray-900">{item.titulo}</h2>
        <p className="text-xs text-gray-500 mt-1">
          Categoria: {item.categoria} • Bairro: {item.bairro}
        </p>
      </header>

      <p className="text-sm text-gray-700 flex-1">{item.descricao}</p>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {labelEstado(item.estadoConservacao)}
        </span>

        <span
          className={
            "inline-flex items-center gap-1 px-2 py-1 rounded-full " +
            (item.status === "disponivel"
              ? "bg-emerald-100 text-emerald-700"
              : item.status === "em-negociacao"
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-200 text-gray-700")
          }
        >
          {labelStatus(item.status)}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={irParaDetalhes}
          className="w-full inline-flex items-center justify-center px-3 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
        >
          Ver detalhes do item
        </button>

        <button
          type="button"
          onClick={handleClickInteresse}
          disabled={!podeClicar}
          className={
            "w-full inline-flex items-center justify-center px-3 py-2 rounded text-sm font-medium " +
            (podeClicar
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed")
          }
        >
          {isDoado
            ? "Item já doado"
            : isDoador
            ? "Você é o doador"
            : "Tenho interesse neste item"}
        </button>
      </div>
    </article>
  );
}

export default function Itens({
  itens,
  onIniciarInteresse,
}: ItensProps) {
  const [termoBusca, setTermoBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [itemSelecionado, setItemSelecionado] = useState<ItemDoacao | null>(
    null
  );
  const [mensagemInteresse, setMensagemInteresse] = useState("");
  const categoriasDisponiveis = Array.from(
    new Set(
      itens
        .map((item) => item.categoria)
        .filter((categoria) => categoria.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  const termo = termoBusca.trim().toLowerCase();

  const itensFiltrados = itens.filter((item) => {
    const atendeBusca =
      termo === "" ||
      item.titulo.toLowerCase().includes(termo) ||
      item.descricao.toLowerCase().includes(termo) ||
      item.categoria.toLowerCase().includes(termo) ||
      item.bairro.toLowerCase().includes(termo);

    const atendeCategoria =
      categoriaSelecionada === "" || item.categoria === categoriaSelecionada;

    const atendeEstado =
      estadoSelecionado === "" ||
      item.estadoConservacao === estadoSelecionado;

    return atendeBusca && atendeCategoria && atendeEstado;
  });

  function abrirModalInteresse(item: ItemDoacao) {
    setItemSelecionado(item);
    setMensagemInteresse("");
  }

  function fecharModal() {
    setItemSelecionado(null);
    setMensagemInteresse("");
  }

  async function confirmarInteresse() {
    if (!itemSelecionado) return;
    const texto = mensagemInteresse.trim();
    if (!texto) {
      alert("Descreva rapidamente seu interesse antes de enviar.");
      return;
    }

    await onIniciarInteresse(itemSelecionado.id, texto);
    fecharModal();
  }

  return (
    <section aria-labelledby="itens-titulo">
      <div className="mb-6">
        <h1
          id="itens-titulo"
          className="text-2xl sm:text-3xl font-bold text-gray-900"
        >
          Itens disponíveis
        </h1>
        <p className="mt-3 text-gray-700 max-w-2xl">
          Abaixo estão os itens para doação. Use a busca e os filtros.
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <input
          type="text"
          placeholder="Buscar por título, descrição, bairro..."
          className="border rounded px-3 py-2 text-sm"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 text-sm"
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categoriasDisponiveis.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2 text-sm"
          value={estadoSelecionado}
          onChange={(e) => setEstadoSelecionado(e.target.value)}
        >
          <option value="">Todos os estados</option>
          <option value="novo">Novo</option>
          <option value="bom">Bom estado</option>
          <option value="regular">Uso regular</option>
          <option value="para-reparo">Necessita reparos</option>
        </select>
      </div>

      {itensFiltrados.length === 0 ? (
        <p className="text-gray-600">Nenhum item encontrado.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itensFiltrados.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSolicitarInteresse={abrirModalInteresse}
            />
          ))}
        </div>
      )}

      {/* Modal de interesse */}
      {itemSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Tenho interesse em: {itemSelecionado.titulo}
            </h2>
            <p className="text-xs text-gray-600 mb-2">
              Esta mensagem será enviada ao doador pela Caixa de Entrada. Evite
              compartilhar dados pessoais sensíveis nesta etapa.
            </p>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm resize-none mb-3"
              rows={4}
              placeholder="Descreva seu interesse, por exemplo: situação da família, necessidade, possibilidade de retirada, etc."
              value={mensagemInteresse}
              onChange={(e) => setMensagemInteresse(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={fecharModal}
                className="px-3 py-1.5 rounded border text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarInteresse}
                className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Enviar interesse
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
