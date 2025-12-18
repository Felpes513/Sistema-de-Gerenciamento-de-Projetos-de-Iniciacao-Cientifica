// Já existente:
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

// 🔄 Novo: formato “mensal/secretaria/orientador” unificado
export interface RelatorioMensal extends Partial<Relatorio> {
  id: number;                     // id_relatorio
  projetoId: number;              // id_projeto
  referenciaMes: string;          // "YYYY-MM"
  ok: boolean;
  observacao?: string | null;
  confirmadoEm?: string;          // ISO
  tituloProjeto?: string;         // secretaria
  orientadorNome?: string;        // secretaria
  idOrientador?: number;          // orientador (opcional)
}

// 🔄 Novo: pendências do mês (secretaria/orientador)
export interface PendenciaMensal {
  projetoId: number;
  tituloProjeto: string;
  orientadorNome?: string;
  mes: string;                    // "YYYY-MM"
}

// 🔄 DTO para confirmar relatório
export interface ConfirmarRelatorioMensalDTO {
  mes: string;                    // "YYYY-MM"
  ok: boolean;
  observacao?: string;
}
