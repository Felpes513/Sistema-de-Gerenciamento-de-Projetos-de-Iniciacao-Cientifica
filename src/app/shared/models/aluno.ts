export interface Aluno {
  id?: number;
  nome: string;
  email: string;
  ra?: string;
  curso?: string;
  telefone?: string;
  documentoNotasUrl?: string;
  possuiTrabalhoRemunerado?: boolean;
}

export interface AlunoConfigView {
  id_aluno: number;
  nome_completo: string;
  email: string;
  status?: string;
  bolsas: {
    id_bolsa: number;
    id_tipo_bolsa: number;
    tipo_bolsa: string;
  }[];
}