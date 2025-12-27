export interface RegisterAlunoData {
  nomeCompleto: string;
  cpf: string;
  email: string;
  senha: string;
  idCurso: number;
  pdf: File;
  possuiTrabalhoRemunerado?: boolean;
}

export interface RegisterOrientadorData {
  nomeCompleto: string;
  email: string;
  senha: string;
  cpf: string;
}

export interface RegisterSecretariaData{
  id: number;
  nome_completo: string;
  email: string;
  cpf: string;
}

export interface RegisterResponse {
  mensagem: string;
  id?: number;
  email?: string;
}
