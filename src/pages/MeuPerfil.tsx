import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const PERFIS_KEY = "reusa_sarandi_perfis";

type PerfilUsuarioLocal = {
  userId: number;
  fotoDataUrl: string;
};

function lerPerfis(): PerfilUsuarioLocal[] {
  try {
    const salvo = window.localStorage.getItem(PERFIS_KEY);
    if (!salvo) return [];
    const parsed = JSON.parse(salvo);
    if (!Array.isArray(parsed)) return [];
    return parsed as PerfilUsuarioLocal[];
  } catch {
    return [];
  }
}

function salvarPerfis(lista: PerfilUsuarioLocal[]) {
  window.localStorage.setItem(PERFIS_KEY, JSON.stringify(lista));
}

export default function MeuPerfil() {
  const { usuario } = useAuth();
  const [foto, setFoto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  if (!usuario) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Meu perfil
        </h1>
        <p className="mt-3 text-gray-700">
          É necessário estar autenticado para visualizar seu perfil.
        </p>
      </section>
    );
  }
    
  const usuarioId = usuario.id;

  useEffect(() => {
    const perfis = lerPerfis();
    const atual = perfis.find((p) => p.userId === usuario.id) || null;
    setFoto(atual?.fotoDataUrl ?? null);
    setCarregando(false);
  }, [usuario.id]);

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const tamanhoMB = file.size / (1024 * 1024);
    if (tamanhoMB > 3) {
      alert(
        `O arquivo selecionado tem ${tamanhoMB.toFixed(
          2
        )} MB. O limite é de 3 MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFoto(dataUrl);

      const perfis = lerPerfis();
      const semAtual = perfis.filter((p) => p.userId !== usuarioId);
      const novo: PerfilUsuarioLocal = {
        userId: usuarioId,
        fotoDataUrl: dataUrl,
      };
      salvarPerfis([...semAtual, novo]);
    };
    reader.onerror = () => {
      alert("Não foi possível ler a imagem selecionada.");
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  }

  function handleRemoverFoto() {
    const ok = window.confirm("Deseja remover a sua foto de perfil?");
    if (!ok) return;

    setFoto(null);
    const perfis = lerPerfis();
    const semAtual = perfis.filter((p) => p.userId !== usuarioId);
    salvarPerfis(semAtual);
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
        Aqui você pode visualizar seus dados básicos e definir uma foto de
        perfil, armazenada localmente no seu navegador nesta versão protótipo.
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
              disabled={carregando}
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
            Nesta versão da aplicação, os dados de login são armazenados em
            <em> localStorage</em> para fins de demonstração. Em uma evolução
            futura, o sistema poderá ser integrado a um backend completo, com
            autenticação segura e armazenamento em banco de dados.
          </p>
        </div>
      </div>
    </section>
  );
}
