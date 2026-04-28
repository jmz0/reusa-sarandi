// src/pages/MeusItens.tsx
import { useState } from "react";
import type { ChangeEvent } from "react";
import type { ItemDoacao } from "../types/ItemDoacao";
import { useAuth } from "../context/AuthContext";

type MeusItensProps = {
  itens: ItemDoacao[];
  onAtualizarStatus: (id: number, novoStatus: ItemDoacao["status"]) => void;
  onRemover: (id: number) => void;
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
  onAtualizarStatus: (id: number, novoStatus: ItemDoacao["status"]) => void;
  onRemover: (id: number) => void;
};

function ItemCard({ item, onAtualizarStatus, onRemover }: ItemCardProps) {
  const [indiceImagem, setIndiceImagem] = useState(0);

  const imagens = item.imagens ?? [];
  const temImagens = imagens.length > 0;
  const temMultiplas = imagens.length > 1;
  const imagemAtual = temImagens ? imagens[indiceImagem] : undefined;

  function irParaAnterior() {
    if (!temMultiplas) return;
    setIndiceImagem((i) => (i === 0 ? imagens.length - 1 : i - 1));
  }

  function irParaProxima() {
    if (!temMultiplas) return;
    setIndiceImagem((i) => (i === imagens.length - 1 ? 0 : i + 1));
  }

  function handleChangeStatus(e: ChangeEvent<HTMLSelectElement>) {
    const valor = e.target.value as ItemDoacao["status"];
    onAtualizarStatus(item.id, valor);
  }

  function handleRemoverClick() {
    const ok = window.confirm(
      "Tem certeza que deseja remover este item? Esta ação não pode ser desfeita."
    );
    if (!ok) return;
    onRemover(item.id);
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

        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-gray-500">
            Status atual: <strong>{labelStatus(item.status)}</strong>
          </span>

          <select
            className="border rounded px-2 py-1 text-xs"
            value={item.status}
            onChange={handleChangeStatus}
          >
            <option value="disponivel">Disponível</option>
            <option value="em-negociacao">Em negociação</option>
            <option value="doado">Doado</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleRemoverClick}
          className="px-3 py-1.5 rounded border border-red-400 text-red-600 text-xs hover:bg-red-50"
        >
          Remover item
        </button>
      </div>
    </article>
  );
}

export default function MeusItens({
  itens,
  onAtualizarStatus,
  onRemover,
}: MeusItensProps) {
  const { usuario } = useAuth();

  if (!usuario) {
    return (
      <section aria-labelledby="meus-itens-titulo">
        <h1
          id="meus-itens-titulo"
          className="text-2xl sm:text-3xl font-bold text-gray-900"
        >
          Meus itens cadastrados
        </h1>
        <p className="mt-3 text-gray-700">
          É necessário estar autenticado para visualizar seus itens.
        </p>
      </section>
    );
  }

  const usuarioId = usuario.id;

  const meusItens = itens.filter((item) => item.ownerId === usuarioId);

  return (
    <section aria-labelledby="meus-itens-titulo">
      <div className="mb-6">
        <h1
          id="meus-itens-titulo"
          className="text-2xl sm:text-3xl font-bold text-gray-900"
        >
          Meus itens cadastrados
        </h1>
        <p className="mt-3 text-gray-700 max-w-2xl">
          Nesta seção são exibidos os itens que você cadastrou na plataforma.
          Você pode atualizar o status (Disponível, Em negociação, Doado) ou
          remover o item quando ele não estiver mais disponível.
        </p>
      </div>

      {meusItens.length === 0 ? (
        <p className="text-gray-600">
          Você ainda não cadastrou nenhum item. Utilize a opção{" "}
          <strong>Cadastrar item</strong> para criar o primeiro registro.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meusItens.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onAtualizarStatus={onAtualizarStatus}
              onRemover={onRemover}
            />
          ))}
        </div>
      )}
    </section>
  );
}
