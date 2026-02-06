import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { ProjetoInscricaoApi } from '@shared/models/projeto';
import { Inscricao } from '@shared/models/inscricao';

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

  listarMinhasInscricoes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscricao/minhas`);
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
          (lista ?? []).map((item): Inscricao => {
            const status = String(item.status ?? item.situacao ?? 'PENDENTE')
              .toUpperCase()
              .trim() as Inscricao['status'];

            return {
              id: item.id_inscricao ?? item.id ?? 0,
              alunoId: item.aluno?.id ?? item.id_aluno ?? item.alunoId ?? 0,
              nome: item.aluno?.nome ?? item.nome_aluno ?? item.nome ?? '',
              matricula: item.aluno?.matricula ?? item.matricula ?? '',
              email: (item.aluno?.email ?? item.email ?? '').trim(),
              status,
              documentoNotasUrl:
                item.documentoNotasUrl ?? item.documento_notas_url ?? null,
              criadoEm: item.created_at ?? '',
              atualizadoEm: item.updated_at ?? item.created_at ?? '',
            };
          })
        )
      );
  }

  listarAprovadosDoProjeto(projetoId: number) {
    return this.http
      .get<{ id_projeto: number; alunos: any[] }>(
        `${this.apiUrl}/projetos/${projetoId}/alunos`
      )
      .pipe(map((r) => r.alunos || []));
  }

  aprovar(inscricaoId: number) {
    return this.http.patch(
      `${this.apiUrl}/inscricao/${inscricaoId}/aprovar`,
      {}
    );
  }

  finalizar(inscricaoId: number) {
    return this.http.patch(
      `${this.apiUrl}/inscricao/${inscricaoId}/finalizar`,
      {}
    );
  }

  rejeitar(inscricaoId: number) {
    return this.http.patch(
      `${this.apiUrl}/inscricao/${inscricaoId}/rejeitar`,
      {}
    );
  }

  excluir(inscricaoId: number) {
    return this.http.delete(`${this.apiUrl}/inscricao/${inscricaoId}`);
  }
}
