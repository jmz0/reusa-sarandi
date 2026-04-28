import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ItemDoacao } from "../types/ItemDoacao";
import { useAuth } from "../context/AuthContext";

type ItemDetalheProps = {
  itens: ItemDoacao[];
  onIniciarInteresse: (itemId: number, mensagem: string) => void;
};

export default function ItemDetalhe({
  itens,
  onIniciarInteresse,
}: ItemDetalheProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const itemId = Number(id);
  const item = itens.find((i) => i.id === itemId) || null;

  const [mensagem, setMensagem] = useState("");

  if (!item) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">
          Item não encontrado
        </h1>
        <p className="mt-3 text-gray-700">
          O item solicitado não foi localizado. Ele pode ter sido removido ou
          estar indisponível.
        </p>
        <button
          type="button"
          onClick={() => navigate("/itens")}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Voltar para lista de itens
        </button>
      </section>
    );
  }

  const itemNaoNulo = item;

  const imagens = item.imagens ?? [];
  const primeiraImagem = imagens[0];

  const isDoador = usuario && item.ownerId && item.ownerId === usuario.id;
  const isDoado = item.status === "doado";

  function handleEnviarInteresse() {
    if (isDoado) {
      alert("Este item já foi doado e não aceita novos interesses.");
      return;
    }

    if (isDoador) {
      alert("Você é o doador deste item e não pode demonstrar interesse nele.");
      return;
    }

    if (!usuario) {
      navigate("/login");
      return;
    }

    const texto = mensagem.trim();
    if (!texto) {
      alert("Descreva seu interesse antes de enviar.");
      return;
    }

    onIniciarInteresse(itemNaoNulo.id, texto);
    setMensagem("");
  }

  return (
    <section aria-labelledby="detalhe-titulo" className="max-w-3xl">
      <h1
        id="detalhe-titulo"
        className="text-2xl sm:text-3xl font-bold text-gray-900"
      >
        {item.titulo}
      </h1>

      <p className="mt-2 text-xs text-gray-500">
        Categoria: {item.categoria} • Bairro: {item.bairro}
      </p>

      {primeiraImagem && (
        <div className="mt-4">
          <img
            src={primeiraImagem.url}
            alt={item.titulo}
            style={{
              transform: `rotate(${primeiraImagem.rotationDeg ?? 0}deg)`,
            }}
            className="w-full max-h-80 object-cover rounded border"
          />
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Descrição do item
        </h2>
        <p className="mt-1 text-sm text-gray-700">{item.descricao}</p>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <p>
          <strong>Estado de conservação:</strong> {item.estadoConservacao}
        </p>
        <p>
          <strong>Status:</strong> {item.status}
        </p>
      </div>

      <div className="mt-6 border-t pt-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">
          Demonstrar interesse neste item
        </h2>
        <p className="text-xs text-gray-600 mb-2">
          Sua mensagem será enviada ao doador pela Caixa de Entrada. Ele poderá
          responder e, se julgar adequado, compartilhar dados de contato.
        </p>

        <textarea
          className="w-full border rounded px-3 py-2 text-sm resize-none"
          rows={4}
          placeholder="Explique brevemente sua situação e interesse no item."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          disabled={isDoador || isDoado}
        />

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/itens")}
            className="px-4 py-2 rounded border text-sm text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleEnviarInteresse}
            disabled={isDoador || isDoado}
            className={
              "px-4 py-2 rounded text-sm font-medium " +
              (isDoado || isDoador
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700")
            }
          >
            {isDoado
              ? "Item já doado"
              : isDoador
              ? "Você é o doador"
              : "Enviar interesse"}
          </button>
        </div>
      </div>
    </section>
  );
}
