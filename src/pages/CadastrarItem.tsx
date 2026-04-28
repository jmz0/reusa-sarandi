import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent, ChangeEvent } from "react";
import type { ItemDoacao } from "../types/ItemDoacao";

type CadastrarItemProps = {
  onAdicionarItem: (dados: {
    titulo: string;
    descricao: string;
    categoria: string;
    bairro: string;
    estadoConservacao: ItemDoacao["estadoConservacao"];
    imagens: { url: string; rotationDeg?: number }[];
  }) => void;
};

type ImagemLocal = {
  id: number;
  url: string;
  rotationDeg: number;
};

const MAX_FILE_MB = 3;
// resolução máxima (largura/altura)
const MAX_DIM = 1280;

// Função auxiliar para comprimir / limitar resolução
async function processarArquivoImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // calcula escala
        const escala = Math.min(MAX_DIM / width, MAX_DIM / height, 1);
        const novoLarg = width * escala;
        const novoAlt = height * escala;

        canvas.width = novoLarg;
        canvas.height = novoAlt;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas não disponível"));
          return;
        }

        ctx.drawImage(img, 0, 0, novoLarg, novoAlt);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // compressão
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Erro ao carregar imagem"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export default function CadastrarItem({ onAdicionarItem }: CadastrarItemProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [bairro, setBairro] = useState("");
  const [estadoConservacao, setEstadoConservacao] =
    useState<ItemDoacao["estadoConservacao"]>("bom");

  const [imagens, setImagens] = useState<ImagemLocal[]>([]);
  const navigate = useNavigate();

  async function handleImagensChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const novasImagens: ImagemLocal[] = [];

    for (const file of files) {
      const tamanhoMB = file.size / (1024 * 1024);
      if (tamanhoMB > MAX_FILE_MB) {
        alert(
          `O arquivo "${file.name}" tem ${tamanhoMB.toFixed(
            2
          )} MB. O limite é de ${MAX_FILE_MB} MB.`
        );
        continue;
      }

      try {
        const urlProcessada = await processarArquivoImagem(file);
        novasImagens.push({
          id: Date.now() + Math.random(),
          url: urlProcessada,
          rotationDeg: 0,
        });
      } catch {
        alert(`Não foi possível processar a imagem "${file.name}".`);
      }
    }

    if (novasImagens.length > 0) {
      setImagens((atual) => [...atual, ...novasImagens]);
    }

    // limpa seleção do input (permite selecionar o mesmo arquivo depois)
    event.target.value = "";
  }

  function rotacionarImagem(id: number, delta: number) {
    setImagens((atual) =>
      atual.map((img) =>
        img.id === id
          ? { ...img, rotationDeg: (img.rotationDeg + delta + 360) % 360 }
          : img
      )
    );
  }

  function removerImagem(id: number) {
    setImagens((atual) => atual.filter((img) => img.id !== id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !titulo.trim() ||
      !descricao.trim() ||
      !bairro.trim() ||
      !categoria.trim()
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (imagens.length === 0) {
      alert("Envie pelo menos uma foto do item.");
      return;
    }

    onAdicionarItem({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      bairro: bairro.trim(),
      estadoConservacao,
      imagens: imagens.map((img) => ({
        url: img.url,
        rotationDeg: img.rotationDeg || 0,
      })),
    });

    // limpar
    setTitulo("");
    setDescricao("");
    setCategoria("");
    setBairro("");
    setEstadoConservacao("bom");
    setImagens([]);

    navigate("/itens");
  }

  return (
    <section aria-labelledby="cad-titulo" className="max-w-xl">
      <h1
        id="cad-titulo"
        className="text-2xl sm:text-3xl font-bold text-gray-900"
      >
        Cadastrar item para doação
      </h1>

      <p className="mt-3 text-gray-700">
        Preencha as informações do item. Pelo menos uma foto é obrigatória para
        facilitar a avaliação visual por quem irá receber a doação.
      </p>

      <form
        className="mt-6 grid gap-4"
        aria-describedby="cad-descricao"
        onSubmit={handleSubmit}
      >
        {/* Título */}
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Título*</span>
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Ex.: Guarda-roupa de 4 portas"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </label>

        {/* Categoria */}
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Categoria*</span>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="Móveis">Móveis</option>
            <option value="Roupas">Roupas</option>
            <option value="Eletrodomésticos">Eletrodomésticos</option>
            <option value="Infantil">Infantil</option>
            <option value="Eletrônicos">Eletrônicos</option>
            <option value="Utensílios domésticos">Utensílios domésticos</option>
            <option value="Esportes e lazer">Esportes e lazer</option>
            <option value="Outros">Outros</option>
          </select>
        </label>

        {/* Estado de conservação */}
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">
            Estado de conservação*
          </span>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={estadoConservacao}
            onChange={(e) =>
              setEstadoConservacao(
                e.target.value as ItemDoacao["estadoConservacao"]
              )
            }
            required
          >
            <option value="novo">Novo</option>
            <option value="bom">Bom</option>
            <option value="regular">Regular</option>
            <option value="para-reparo">Para reparo</option>
          </select>
        </label>

        {/* Descrição */}
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Descrição*</span>
          <textarea
            className="border rounded px-3 py-2 text-sm"
            rows={4}
            placeholder="Descreva o estado, dimensões, reparos necessários, etc."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </label>

        {/* Bairro */}
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Bairro*</span>
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Ex.: Jardim São José"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            required
          />
        </label>

        {/* Upload múltiplo de imagens */}
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">
            Fotos do item* (até {MAX_FILE_MB} MB cada)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagensChange}
            className="text-sm"
          />
          <span className="text-xs text-gray-500">
            As imagens serão automaticamente redimensionadas para até {MAX_DIM}px.
          </span>
        </label>

        {/* Galeria de pré-visualização, com rotação/remoção */}
        {imagens.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {imagens.map((img) => (
              <div
                key={img.id}
                className="border rounded p-2 flex flex-col items-center gap-2 bg-white"
              >
                <div className="w-full h-32 overflow-hidden flex items-center justify-center">
                  <img
                    src={img.url}
                    alt="Pré-visualização"
                    style={{ transform: `rotate(${img.rotationDeg}deg)` }}
                    className="object-cover w-full h-full rounded"
                  />
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => rotacionarImagem(img.id, -90)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    ↺ Girar -90°
                  </button>
                  <button
                    type="button"
                    onClick={() => rotacionarImagem(img.id, 90)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    ↻ Girar +90°
                  </button>
                  <button
                    type="button"
                    onClick={() => removerImagem(img.id)}
                    className="px-2 py-1 border rounded border-red-400 text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão */}
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Salvar cadastro
        </button>

        <p id="cad-descricao" className="text-xs text-gray-500">
          Os campos marcados com * são obrigatórios. As fotos são processadas somente
          no navegador e armazenadas localmente nesta versão protótipo.
        </p>
      </form>
    </section>
  );
}
