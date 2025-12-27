// src/app/shared/interfaces/projeto.ts
import { Aluno } from '@shared/models/aluno';

export type StatusProjeto = 'EM_EXECUCAO' | 'CONCLUIDO';
export type StatusEnvio = 'ENVIADO' | 'NAO_ENVIADO';
export type EtapaDocumento = 'IDEIA' | 'PARCIAL' | 'FINAL';

/** DTO usado pelo endpoint POST /projetos/update-alunos */
export interface UpdateProjetoAlunosDTO {
  id_projeto: number;
  ids_alunos_aprovados: number[]; // ids de ALUNO aprovados pelo orientador
}

export interface ProjetoInscricaoApi {
  id_inscricao?: number;
  id_aluno?: number;
  id?: number;
  aluno_id?: number;
  idAluno?: number;
  aluno?: {
    id?: number;
    nome?: string;
    email?: string;
    matricula?: string;
  };
  nome_aluno?: string;
  nome?: string;
  nome_completo?: string;
  email?: string;
  matricula?: string;
  status?: string;
  situacao?: string;
  possuiTrabalhoRemunerado?: boolean;
  possui_trabalho_remunerado?: boolean;
  documentoNotasUrl?: string | null;
  created_at?: string | null;
}

export interface ProjetoRequest {
  titulo_projeto: string;
  resumo: string;
  id_orientador: number;
  id_campus: number;
  cod_projeto?: string;
  ideia_inicial_b64?: string;
  ideia_inicial_pdf_b64?: string;
  concluido?: boolean;
}

export interface ProjetoFormulario {
  titulo_projeto: string;
  resumo?: string;
  orientador_nome: string;
  id_campus: number;
  tipo_bolsa?: string | null;
}

export interface ProjetoCadastro {
  titulo_projeto: string;
  resumo: string;
  orientador_nome: string;
  orientador_email: string;
  id_campus: number;
  quantidadeMaximaAlunos: number;
  tipo_bolsa?: string | null;
}
export interface Projeto {
  id: number;
  nomeProjeto: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  nomesAlunos: string[];
  inscritosTotal?: number;
  concluido?: boolean;
  status?: string;
}

export interface ProjetoDetalhado {
  id: number;
  nomeProjeto: string;
  titulo_projeto: string;
  resumo?: string;
  campus: string;
  quantidadeMaximaAlunos: number;
  nomeOrientador: string;
  orientador_email?: string;
  nomesAlunos: string[];
  alunos?: Aluno[];
  id_orientador: number;
  id_campus: number;
  data_criacao?: string;
  data_atualizacao?: string;
  concluido?: boolean;
  tipo_bolsa?: string | null;
  status?: string;
}

export interface DocumentoHistorico {
  etapa: EtapaDocumento;
  status: StatusEnvio;
  dataEnvio?: Date;
  arquivos?: { docx?: { nome: string }; pdf?: { nome: string } };
}

export interface AlunoDoProjeto {
  id_aluno: number;
  nome_completo: string;
  email: string;
  possuiTrabalhoRemunerado: boolean;
}
