export interface AlunoSecretariaView {
  idInscricao: number;
  idAluno: number;
  nome: string;
  matricula: string;
  email: string;
  status: string;
  possuiTrabalhoRemunerado: boolean;
  documentoNotasUrl?: string | null;
}
