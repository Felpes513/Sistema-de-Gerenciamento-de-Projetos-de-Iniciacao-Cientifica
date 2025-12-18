export interface AvaliadorExterno {
  id?: number;
  nome: string;
  email: string;
  especialidade: string;
  subespecialidade: string;
  link_lattes: string;
}

export interface EnvioProjeto {
  id_envio?: number;
  id?: number;
  id_projeto?: number;
  projeto_id?: number;
  titulo_projeto?: string;
  projeto_titulo?: string;
  titulo?: string;
  assunto?: string;
  mensagem?: string;
  destinatarios?: string[] | string | null;
  enviado_em?: string | null;
  data_envio?: string | null;
  created_at?: string | null;
  [key: string]: any;
}
