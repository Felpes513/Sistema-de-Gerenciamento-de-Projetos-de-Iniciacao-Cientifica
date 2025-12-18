export interface Inscricao {
  id: number;
  alunoId: number;
  nome: string;
  matricula: string;
  email: string;
  status: 'PENDENTE' | 'VALIDADO' | 'CADASTRADO_FINAL' | 'REJEITADO';
  documentoNotasUrl?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}
