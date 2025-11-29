import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { ProjetoInscricaoApi } from '@interfaces/projeto';
import { Inscricao } from '@interfaces/inscricao';

@Injectable({ providedIn: 'root' })
export class InscricoesService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  inscrever(projetoId: number) {
    return this.http.post<{
      success: boolean;
      message: string;
      data?: { id_inscricao: number };
    }>(`${this.apiUrl}/inscricao/inscrever`, { id_projeto: projetoId });
  }

  listarPorProjeto(
    projetoId: number,
    _status?: string,
    _pagina = 1,
    _limite = 20,
    _ordenarPor = 'nome',
    _ordem: 'asc' | 'desc' = 'asc'
  ): Observable<Inscricao[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/projetos/${projetoId}/inscricoes`)
      .pipe(
        map((lista) =>
          (lista ?? []).map(
            (item): Inscricao => ({
              id: item.id_inscricao,
              alunoId: item.aluno?.id ?? item.id_aluno ?? 0,
              nome: item.aluno?.nome ?? item.nome_aluno ?? '',
              matricula: item.matricula ?? '',
              email: item.aluno?.email ?? item.email ?? '',
              status: (item.status ?? 'PENDENTE') as Inscricao['status'],
              documentoNotasUrl:
                item.documentoNotasUrl ?? item.documento_notas_url ?? null,
              criadoEm: item.created_at ?? '',
              atualizadoEm: item.updated_at ?? item.created_at ?? '',
            })
          )
        )
      );
  }
  /**
   * Lista alunos já vinculados ao projeto (tb_projeto_aluno).
   * Essa rota é mais para estágio "final" (CADASTRADO_FINAL).
   */
  listarAprovadosDoProjeto(projetoId: number) {
    return this.http
      .get<{ id_projeto: number; alunos: any[] }>(
        `${this.apiUrl}/projetos/${projetoId}/alunos`
      )
      .pipe(map((r) => r.alunos || []));
  }

  aprovar(inscricaoId: number) {
    return this.http.patch(
      `${this.apiUrl}/inscricoes/${inscricaoId}/aprovar`,
      {}
    );
  }

  finalizar(inscricaoId: number) {
    return this.http.patch(
      `${this.apiUrl}/inscricoes/${inscricaoId}/finalizar`,
      {}
    );
  }

  rejeitar(inscricaoId: number) {
    return this.http.patch(
      `${this.apiUrl}/inscricoes/${inscricaoId}/rejeitar`,
      {}
    );
  }

  excluir(inscricaoId: number) {
    return this.http.delete(`${this.apiUrl}/inscricoes/${inscricaoId}`);
  }

  uploadDocumento(inscricaoId: number, arquivo: File) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    return this.http.put(
      `${this.apiUrl}/inscricoes/${inscricaoId}/documento-notas`,
      formData
    );
  }
}
