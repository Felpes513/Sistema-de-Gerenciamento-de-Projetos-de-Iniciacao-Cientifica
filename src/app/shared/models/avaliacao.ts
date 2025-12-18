export interface ProjetoBasico {
  id: number;
  titulo: string;
  pdfUrl: string;
}

export interface AvaliacaoEnvio {
  projetoId: number;
  avaliadorIds: number[];
}

export interface ConviteAvaliacaoResponse {
  totalConvites: number;
  mensagem: string;
}

export interface AvaliacaoLinkInfo {
  projetoTitulo: string;
  pdfUrl: string;
  alunoNome?: string;
  orientadorNome?: string;
}

export interface AvaliacaoSalvarDTO {
  observacoes: string;
  nota: number;
}
