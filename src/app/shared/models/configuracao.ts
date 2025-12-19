export interface Campus {
  id_campus: number;
  campus: string;
}

export interface Curso {
  id_curso: number;
  nome: string;
}

export interface TipoBolsa {
  id_tipo_bolsa: number;
  tipo_bolsa: string;
}

export interface BolsaCreateDto {
  id_aluno: number;
  id_tipo_bolsa: number;
}

export interface BolsaListItem {
  id_bolsa: number;
  id_aluno: number;
  aluno_nome: string;
  aluno_email: string;
  id_tipo_bolsa: number;
  tipo_bolsa: string;
  created_at: string;
}

export interface BolsaListResponse {
  bolsas: BolsaListItem[];
  limit: number;
  offset: number;
  count: number;
}
