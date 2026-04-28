export type ImagemItem = {
  url: string;
  rotationDeg?: number;
};

export type ItemDoacao = {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  bairro: string;
  estadoConservacao: "novo" | "bom" | "regular" | "para-reparo";
  status: "disponivel" | "em-negociacao" | "doado";

    imagens?: ImagemItem[];

  criadoPorUsuario: boolean;

  ownerId?: number; // <-- id do usuário que cadastrou o item
};

