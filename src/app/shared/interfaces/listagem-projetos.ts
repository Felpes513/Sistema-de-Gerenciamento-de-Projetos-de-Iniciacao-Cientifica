import { Inscricao } from '@interfaces/inscricao';

export interface ListagemResponse {
  projetoId: number;
  capacidadeMaxima: number;
  totalInscritos: number;
  totalAprovados: number;
  itens: Inscricao[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    temMais: boolean;
  };
}