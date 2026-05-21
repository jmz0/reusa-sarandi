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
    imagens: { file?: File; url: string; rotationDeg?: number }[];
  }) => void | Promise<void>;
};

type ImagemLocal = {
  id: number;
  file: File;
  url: string;
  rotationDeg: number;
};

const MAX_FILE_MB = 3;
const MAX_DIM = 1280;

async function processarArquivoImagem(
  file: File
): Promise<{ file: File; url: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        const escala = Math.min(MAX_DIM / width, MAX_DIM / height, 1);
        width *= escala;
        height *= escala;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas nao disponivel"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Nao foi possivel gerar a imagem"));
              return;
            }

            const nomeBase = file.name.replace(/\.[^.]+$/, "");
            const imagemProcessada = new File([blob], `${nomeBase}.jpg`, {
              type: "image/jpeg",
            });

            resolve({
              file: imagemProcessada,
              url: URL.createObjectURL(imagemProcessada),
            });
          },
          "image/jpeg",
          0.8
        );
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
  const [salvando, setSalvando] = useState(false);
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
          )} MB. O limite e de ${MAX_FILE_MB} MB.`
        );
        continue;
      }

      try {
        const imagem = await processarArquivoImagem(file);
        novasImagens.push({
          id: Date.now() + Math.random(),
          file: imagem.file,
          url: imagem.url,
          rotationDeg: 0,
        });
      } catch {
        alert(`Nao foi possivel processar a imagem "${file.name}".`);
      }
    }

    if (novasImagens.length > 0) {
      setImagens((atual) => [...atual, ...novasImagens]);
    }

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
    setImagens((atual) => {
      const removida = atual.find((img) => img.id === id);
      if (removida) URL.revokeObjectURL(removida.url);
      return atual.filter((img) => img.id !== id);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !titulo.trim() ||
      !descricao.trim() ||
      !bairro.trim() ||
      !categoria.trim()
    ) {
      alert("Preencha todos os campos obrigatorios.");
      return;
    }

    if (imagens.length === 0) {
      alert("Envie pelo menos uma foto do item.");
      return;
    }

    try {
      setSalvando(true);
      await onAdicionarItem({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        bairro: bairro.trim(),
        estadoConservacao,
        imagens: imagens.map((img) => ({
          file: img.file,
          url: img.url,
          rotationDeg: img.rotationDeg || 0,
        })),
      });

      imagens.forEach((img) => URL.revokeObjectURL(img.url));
      setTitulo("");
      setDescricao("");
      setCategoria("");
      setBairro("");
      setEstadoConservacao("bom");
      setImagens([]);

      navigate("/itens");
    } catch (error: any) {
      alert(error.message ?? "Nao foi possivel cadastrar o item.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section aria-labelledby="cad-titulo" className="max-w-xl">
      <h1
        id="cad-titulo"
        className="text-2xl sm:text-3xl font-bold text-gray-900"
      >
        Cadastrar item para doacao
      </h1>

      <p className="mt-3 text-gray-700">
        Preencha as informacoes do item. Pelo menos uma foto e obrigatoria para
        facilitar a avaliacao visual por quem ira receber a doacao.
      </p>

      <form
        className="mt-6 grid gap-4"
        aria-describedby="cad-descricao"
        onSubmit={handleSubmit}
      >
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Titulo*</span>
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Ex.: Guarda-roupa de 4 portas"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Categoria*</span>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="Moveis">Moveis</option>
            <option value="Roupas">Roupas</option>
            <option value="Eletrodomesticos">Eletrodomesticos</option>
            <option value="Infantil">Infantil</option>
            <option value="Eletronicos">Eletronicos</option>
            <option value="Utensilios domesticos">Utensilios domesticos</option>
            <option value="Esportes e lazer">Esportes e lazer</option>
            <option value="Outros">Outros</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">
            Estado de conservacao*
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

        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Descricao*</span>
          <textarea
            className="border rounded px-3 py-2 text-sm"
            rows={4}
            placeholder="Descreva o estado, dimensoes, reparos necessarios, etc."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Bairro*</span>
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Ex.: Jardim Sao Jose"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">
            Fotos do item* (ate {MAX_FILE_MB} MB cada)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagensChange}
            className="text-sm"
          />
          <span className="text-xs text-gray-500">
            As imagens serao automaticamente redimensionadas para ate {MAX_DIM}px.
          </span>
        </label>

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
                    alt="Pre-visualizacao"
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
                    Girar -90
                  </button>
                  <button
                    type="button"
                    onClick={() => rotacionarImagem(img.id, 90)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    Girar +90
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

        <button
          type="submit"
          disabled={salvando}
          className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {salvando ? "Salvando..." : "Salvar cadastro"}
        </button>

        <p id="cad-descricao" className="text-xs text-gray-500">
          Os campos marcados com * sao obrigatorios. As fotos sao enviadas ao
          backend e salvas localmente em backend/uploads.
        </p>
      </form>
    </section>
  );
}
