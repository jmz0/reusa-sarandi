// src/types/Mensagem.ts

export type ThreadStatus = "aberta" | "encerrada";

export type Thread = {
  id: number;
  itemId: number;      
  donorId: number;     
  receiverId: number;  
  createdAt: string;
  lastUpdatedAt: string;
  status: ThreadStatus;
};

export type Mensagem = {
  id: number;
  threadId: number;
  fromUserId: number;
  toUserId: number;
  body: string;
  createdAt: string;
  lidaPeloDestinatario: boolean;
};
