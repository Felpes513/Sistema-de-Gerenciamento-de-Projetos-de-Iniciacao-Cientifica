import { Inscricao } from '@shared/models/inscricao';

export interface ListagemResponse {
  projetoId: number;
  capacidadeMaxima: number;
  totalInscritos: number;
  totalAprovados: number;
  concluido?: boolean;
  itens: Inscricao[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    temMais: boolean;
  };
}