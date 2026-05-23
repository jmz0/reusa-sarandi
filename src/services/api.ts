import type { ItemDoacao } from "../types/ItemDoacao";
import type { Usuario } from "../context/AuthContext";
import type { Mensagem, Thread } from "../types/Mensagem";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

type ApiUsuario = {
  id: number;
  nome: string;
  email: string;
};

type ApiImagem = {
  caminho: string;
  rotationDeg?: number;
  rotation_deg?: number;
};

type ApiItem = {
  id: number;
  doadorId: number;
  doador_id?: number;
  titulo: string;
  descricao: string;
  categoria: string;
  estadoConservacao: string;
  estado_conservacao?: string;
  status: string;
  localizacao?: string | null;
  bairro?: string | null;
  imagens?: ApiImagem[];
};

type NovoItemApiInput = {
  doadorId: number;
  titulo: string;
  descricao: string;
  categoria: string;
  bairro: string;
  estadoConservacao: ItemDoacao["estadoConservacao"];
};

type ImagemUploadInput = {
  file: File;
  rotationDeg?: number;
};

type ApiThread = {
  id: number;
  itemId: number;
  itemTitulo?: string;
  doadorId: number;
  doadorNome?: string;
  interessadoId: number;
  interessadoNome?: string;
  status: string;
  naoLidas?: number;
  criadoEm: string;
  atualizadoEm: string;
};

type ApiMensagem = {
  id: number;
  threadId: number;
  remetenteId: number;
  remetenteNome?: string;
  texto: string;
  lida: boolean;
  criadoEm: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers);

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      payload && typeof payload.erro === "string"
        ? payload.erro
        : "Nao foi possivel concluir a operacao.";
    throw new Error(message);
  }

  return payload as T;
}

function toAbsoluteImageUrl(caminho: string): string {
  if (
    caminho.startsWith("http://") ||
    caminho.startsWith("https://") ||
    caminho.startsWith("data:")
  ) {
    return caminho;
  }

  return `${API_BASE_URL}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

function mapUsuario(usuario: ApiUsuario): Usuario {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  };
}

function mapEstadoBackend(
  estado: ItemDoacao["estadoConservacao"]
): "novo" | "bom" | "usado" | "precisa_reparo" {
  if (estado === "regular") return "usado";
  if (estado === "para-reparo") return "precisa_reparo";
  return estado;
}

function mapEstadoFrontend(estado: string): ItemDoacao["estadoConservacao"] {
  if (estado === "usado") return "regular";
  if (estado === "precisa_reparo") return "para-reparo";
  if (estado === "novo" || estado === "bom") return estado;
  return "bom";
}

function mapStatusBackend(
  status: ItemDoacao["status"]
): "disponivel" | "reservado" | "doado" {
  if (status === "em-negociacao") return "reservado";
  return status;
}

function mapStatusFrontend(status: string): ItemDoacao["status"] {
  if (status === "reservado") return "em-negociacao";
  if (status === "doado") return "doado";
  return "disponivel";
}

function mapItem(item: ApiItem): ItemDoacao {
  const doadorId = item.doadorId ?? item.doador_id ?? 0;
  const estado = item.estadoConservacao ?? item.estado_conservacao ?? "bom";

  return {
    id: item.id,
    titulo: item.titulo,
    descricao: item.descricao,
    categoria: item.categoria,
    bairro: item.bairro ?? item.localizacao ?? "",
    estadoConservacao: mapEstadoFrontend(estado),
    status: mapStatusFrontend(item.status),
    imagens: (item.imagens ?? []).map((imagem) => ({
      url: toAbsoluteImageUrl(imagem.caminho),
      rotationDeg: imagem.rotationDeg ?? imagem.rotation_deg ?? 0,
    })),
    criadoPorUsuario: doadorId > 0,
    ownerId: doadorId,
  };
}

function mapThread(thread: ApiThread): Thread {
  return {
    id: thread.id,
    itemId: thread.itemId,
    donorId: thread.doadorId,
    receiverId: thread.interessadoId,
    createdAt: thread.criadoEm,
    lastUpdatedAt: thread.atualizadoEm,
    status: thread.status === "arquivada" ? "encerrada" : "aberta",
    itemTitulo: thread.itemTitulo,
    donorNome: thread.doadorNome,
    receiverNome: thread.interessadoNome,
    naoLidas: thread.naoLidas ?? 0,
  };
}

function mapMensagem(mensagem: ApiMensagem, thread: Thread): Mensagem {
  const fromUserId = mensagem.remetenteId;
  const toUserId =
    fromUserId === thread.donorId ? thread.receiverId : thread.donorId;

  return {
    id: mensagem.id,
    threadId: mensagem.threadId,
    fromUserId,
    toUserId,
    body: mensagem.texto,
    createdAt: mensagem.criadoEm,
    lidaPeloDestinatario: mensagem.lida,
  };
}

export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string
): Promise<Usuario> {
  const data = await request<{ usuario: ApiUsuario }>("/api/auth/cadastro", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha }),
  });

  return mapUsuario(data.usuario);
}

export async function loginUsuario(
  email: string,
  senha: string
): Promise<Usuario> {
  const data = await request<{ usuario: ApiUsuario }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });

  return mapUsuario(data.usuario);
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario | null> {
  try {
    const data = await request<{ usuario: ApiUsuario }>(`/api/usuarios/${id}`);
    return mapUsuario(data.usuario);
  } catch {
    return null;
  }
}

export async function listarItens(): Promise<ItemDoacao[]> {
  const data = await request<{ itens: ApiItem[] }>("/api/itens");
  return data.itens.map(mapItem);
}

export async function criarItem(dados: NovoItemApiInput): Promise<ItemDoacao> {
  const data = await request<{ item: ApiItem }>("/api/itens", {
    method: "POST",
    body: JSON.stringify({
      doadorId: dados.doadorId,
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      estadoConservacao: mapEstadoBackend(dados.estadoConservacao),
      localizacao: dados.bairro,
    }),
  });

  return mapItem(data.item);
}

export async function enviarImagensItem(
  itemId: number,
  imagens: ImagemUploadInput[]
): Promise<void> {
  const formData = new FormData();

  imagens.forEach((imagem) => {
    formData.append("imagens", imagem.file);
    formData.append("rotationDeg", String(imagem.rotationDeg ?? 0));
  });

  await request(`/api/itens/${itemId}/imagens`, {
    method: "POST",
    body: formData,
  });
}

export async function atualizarStatusItem(
  itemId: number,
  status: ItemDoacao["status"]
): Promise<void> {
  await request(`/api/itens/${itemId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: mapStatusBackend(status) }),
  });
}

export async function removerItem(itemId: number): Promise<void> {
  await request(`/api/itens/${itemId}`, {
    method: "DELETE",
  });
}

export async function listarThreadsUsuario(usuarioId: number): Promise<Thread[]> {
  const data = await request<{ threads: ApiThread[] }>(
    `/api/threads/usuario/${usuarioId}`
  );

  return data.threads.map(mapThread);
}

export async function criarOuReutilizarThread(
  itemId: number,
  interessadoId: number
): Promise<Thread> {
  const data = await request<{ thread: ApiThread }>("/api/threads", {
    method: "POST",
    body: JSON.stringify({ itemId, interessadoId }),
  });

  return mapThread(data.thread);
}

export async function listarMensagensThread(
  thread: Thread,
  usuarioId: number
): Promise<Mensagem[]> {
  const data = await request<{ mensagens: ApiMensagem[] }>(
    `/api/mensagens/thread/${thread.id}?usuarioId=${usuarioId}`
  );

  return data.mensagens.map((mensagem) => mapMensagem(mensagem, thread));
}

export async function enviarMensagemThread(
  thread: Thread,
  remetenteId: number,
  texto: string
): Promise<Mensagem> {
  const data = await request<{ mensagem: ApiMensagem }>("/api/mensagens", {
    method: "POST",
    body: JSON.stringify({
      threadId: thread.id,
      remetenteId,
      texto,
    }),
  });

  return mapMensagem(data.mensagem, thread);
}

export async function marcarMensagensThreadLidas(
  threadId: number,
  usuarioId: number
): Promise<void> {
  await request(`/api/mensagens/thread/${threadId}/lidas`, {
    method: "PATCH",
    body: JSON.stringify({ usuarioId }),
  });
}
