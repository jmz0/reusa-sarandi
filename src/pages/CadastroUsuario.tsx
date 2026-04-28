import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CadastroUsuario() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    try {
      cadastrar(nome, email, senha);
      navigate("/meus-itens");
    } catch (err: any) {
      setErro(err.message ?? "Não foi possível realizar o cadastro.");
    }
  }

  return (
    <section
      aria-labelledby="cad-usuario-titulo"
      className="max-w-md mx-auto"
    >
      <h1
        id="cad-usuario-titulo"
        className="text-2xl sm:text-3xl font-bold text-gray-900"
      >
        Criar conta
      </h1>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Nome</span>
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">E-mail</span>
          <input
            type="email"
            className="border rounded px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-sm text-gray-800">Senha</span>
          <input
            type="password"
            className="border rounded px-3 py-2 text-sm"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Cadastrar
        </button>

        <p className="text-xs text-gray-600">
          Já possui cadastro?{" "}
          <Link to="/login" className="text-blue-700 hover:underline">
            Fazer login
          </Link>
        </p>
      </form>
    </section>
  );
}
