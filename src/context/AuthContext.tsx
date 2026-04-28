// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

type UsuarioPersistido = Usuario & {
  senha: string;
  criadoEm: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  cadastrar: (nome: string, email: string, senha: string) => void;
  entrar: (email: string, senha: string) => void;
  sair: () => void;
  obterUsuarioPorId: (id: number) => Usuario | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "reusa_sarandi_usuarios";
const USER_LOGADO_KEY = "reusa_sarandi_usuario_atual";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Carrega usuário logado no início
  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(USER_LOGADO_KEY);
      if (!salvo) return;
      const parsed = JSON.parse(salvo) as Usuario;
      setUsuario(parsed);
    } catch {
      // em app real, logar erro
    }
  }, []);

  function lerUsuarios(): UsuarioPersistido[] {
    try {
      const salvo = window.localStorage.getItem(USERS_KEY);
      if (!salvo) return [];
      const parsed = JSON.parse(salvo);
      if (!Array.isArray(parsed)) return [];
      return parsed as UsuarioPersistido[];
    } catch {
      return [];
    }
  }

  function salvarUsuarios(lista: UsuarioPersistido[]) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(lista));
  }

  function cadastrar(nome: string, email: string, senha: string) {
    const usuarios = lerUsuarios();

    const jaExiste = usuarios.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (jaExiste) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    const novoId =
      usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;

    const novo: UsuarioPersistido = {
      id: novoId,
      nome,
      email,
      senha,
      criadoEm: new Date().toISOString(),
    };

    const atualizada = [...usuarios, novo];
    salvarUsuarios(atualizada);

    const usuarioVisivel: Usuario = {
      id: novo.id,
      nome: novo.nome,
      email: novo.email,
    };

    window.localStorage.setItem(
      USER_LOGADO_KEY,
      JSON.stringify(usuarioVisivel)
    );
    setUsuario(usuarioVisivel);
  }

  function entrar(email: string, senha: string) {
    const usuarios = lerUsuarios();
    const encontrado = usuarios.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );

    if (!encontrado) {
      throw new Error("E-mail ou senha inválidos.");
    }

    const usuarioVisivel: Usuario = {
      id: encontrado.id,
      nome: encontrado.nome,
      email: encontrado.email,
    };
    window.localStorage.setItem(
      USER_LOGADO_KEY,
      JSON.stringify(usuarioVisivel)
    );
    setUsuario(usuarioVisivel);
  }

  function sair() {
    window.localStorage.removeItem(USER_LOGADO_KEY);
    setUsuario(null);
  }

  function obterUsuarioPorId(id: number): Usuario | null {
  // Usuário "sistema" para itens iniciais (mock)
    if (id === 0) {
    return {
      id: 0,
      nome: "Doador da plataforma",
      email: "doacoes@reusasarandi.local",
    };
    }
    const usuarios = lerUsuarios();
    const encontrado = usuarios.find((u) => u.id === id);
    if (!encontrado) return null;
    return {
      id: encontrado.id,
      nome: encontrado.nome,
      email: encontrado.email,
    };
  }

  const value: AuthContextType = {
    usuario,
    cadastrar,
    entrar,
    sair,
    obterUsuarioPorId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
