export interface Relatorio {
  id?: number;
  projetoId: number;
  referenciaMes: string;
  resumo: string;
  atividades?: string;
  bloqueios?: string;
  proximosPassos?: string;
  horas?: number;
  anexoUrl?: string;
  criadoEm?: string;
}

export interface RelatorioMensal extends Partial<Relatorio> {
  id: number;
  projetoId: number;
  referenciaMes: string;
  ok: boolean;
  observacao?: string | null;
  confirmadoEm?: string;
  tituloProjeto?: string;
  orientadorNome?: string;
  idOrientador?: number;
}

export interface PendenciaMensal {
  projetoId: number;
  tituloProjeto: string;
  orientadorNome?: string;
  mes: string;
}

export interface ConfirmarRelatorioMensalDTO {
  mes: string;
  ok: boolean;
  observacao?: string;
}

export interface RelatorioAlunosFiltro {
  nome?: string;
  email?: string;
  cpf?: string;
  data_conclusao?: string;
  ciclo?: string;
}
