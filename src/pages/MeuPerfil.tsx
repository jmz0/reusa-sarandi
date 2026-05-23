import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../components/Feedback";

const fotosPerfilPorUsuario = new Map<number, string>();

export default function MeuPerfil() {
  const { usuario } = useAuth();
  const { mostrarFeedback } = useFeedback();
  const [foto, setFoto] = useState<string | null>(
    usuario ? fotosPerfilPorUsuario.get(usuario.id) ?? null : null
  );

  if (!usuario) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Meu perfil
        </h1>
        <p className="mt-3 text-gray-700">
          E necessario estar autenticado para visualizar seu perfil.
        </p>
      </section>
    );
  }

  const usuarioId = usuario.id;

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const tamanhoMB = file.size / (1024 * 1024);
    if (tamanhoMB > 3) {
      mostrarFeedback(
        `O arquivo selecionado tem ${tamanhoMB.toFixed(
          2
        )} MB. O limite e de 3 MB.`,
        "erro"
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFoto(dataUrl);
      fotosPerfilPorUsuario.set(usuarioId, dataUrl);
    };
    reader.onerror = () => {
      mostrarFeedback("Nao foi possivel ler a imagem selecionada.", "erro");
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  }

  function handleRemoverFoto() {
    setFoto(null);
    fotosPerfilPorUsuario.delete(usuarioId);
    mostrarFeedback("Foto de perfil removida.", "sucesso");
  }

  return (
    <section aria-labelledby="meu-perfil-titulo" className="max-w-3xl">
      <h1
        id="meu-perfil-titulo"
        className="text-2xl sm:text-3xl font-bold text-gray-900"
      >
        Meu perfil
      </h1>

      <p className="mt-3 text-gray-700">
        Aqui voce pode visualizar seus dados basicos e definir uma foto de
        perfil temporaria nesta versao prototipo.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border">
            {foto ? (
              <img
                src={foto}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500 text-center px-2">
                Nenhuma foto cadastrada
              </span>
            )}
          </div>

          <label className="text-xs text-gray-700">
            <span className="block mb-1 font-medium">
              Alterar foto de perfil
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="text-xs"
            />
          </label>

          {foto && (
            <button
              type="button"
              onClick={handleRemoverFoto}
              className="px-3 py-1.5 rounded border border-red-400 text-red-600 text-xs hover:bg-red-50"
            >
              Remover foto
            </button>
          )}
        </div>

        <div className="flex-1 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Nome:</strong> {usuario.nome}
          </p>
          <p>
            <strong>E-mail:</strong> {usuario.email}
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Nesta etapa, a sessao do usuario autenticado fica salva localmente.
            Os dados principais de usuarios e itens sao carregados pelo backend.
          </p>
        </div>
      </div>
    </section>
  );
}
