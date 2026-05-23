// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  buscarUsuarioPorId,
  cadastrarUsuario,
  loginUsuario,
} from "../services/api";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
  obterUsuarioPorId: (id: number) => Usuario | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_LOGADO_KEY = "reusa_sarandi_usuario_atual";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [usuariosCache, setUsuariosCache] = useState<Record<number, Usuario>>(
    {}
  );

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(USER_LOGADO_KEY);
      if (!salvo) return;

      const parsed = JSON.parse(salvo) as Usuario;
      setUsuario(parsed);
      setUsuariosCache((atual) => ({ ...atual, [parsed.id]: parsed }));
    } catch {
      window.localStorage.removeItem(USER_LOGADO_KEY);
    }
  }, []);

  function salvarUsuarioAtual(usuarioAtual: Usuario) {
    window.localStorage.setItem(
      USER_LOGADO_KEY,
      JSON.stringify(usuarioAtual)
    );
    setUsuario(usuarioAtual);
    setUsuariosCache((atual) => ({
      ...atual,
      [usuarioAtual.id]: usuarioAtual,
    }));
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    const usuarioCriado = await cadastrarUsuario(nome, email, senha);
    salvarUsuarioAtual(usuarioCriado);
  }

  async function entrar(email: string, senha: string) {
    const usuarioAutenticado = await loginUsuario(email, senha);
    salvarUsuarioAtual(usuarioAutenticado);
  }

  function sair() {
    window.localStorage.removeItem(USER_LOGADO_KEY);
    setUsuario(null);
  }

  function obterUsuarioPorId(id: number): Usuario | null {
    if (usuariosCache[id]) {
      return usuariosCache[id];
    }

    void buscarUsuarioPorId(id).then((encontrado) => {
      if (!encontrado) return;
      setUsuariosCache((atual) => ({
        ...atual,
        [encontrado.id]: encontrado,
      }));
    });

    return null;
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
