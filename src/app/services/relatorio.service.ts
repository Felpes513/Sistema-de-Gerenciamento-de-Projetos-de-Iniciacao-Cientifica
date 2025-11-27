import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  RelatorioMensal,
  PendenciaMensal,
  ConfirmarRelatorioMensalDTO,
} from '@interfaces/relatorio';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  listarDoMes(mes?: string): Observable<RelatorioMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;

    return this.http
      .get<any[]>(`${this.apiUrl}/me/relatorios-mensais`, { params })
      .pipe(
        map((rows) =>
          (rows || []).map(
            (r) =>
              ({
                id: r.id_relatorio,
                projetoId: r.id_projeto,
                referenciaMes: r.mes,
                ok: !!r.ok,
                observacao: r.observacao ?? null,
                confirmadoEm: r.confirmado_em,
                idOrientador: r.id_orientador,
              } as RelatorioMensal)
          )
        )
      );
  }

  listarPendentesDoMes(mes?: string): Observable<PendenciaMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;

    return this.http
      .get<any[]>(`${this.apiUrl}/me/relatorios-mensais/pendentes`, { params })
      .pipe(
        map((rows) =>
          (rows || []).map(
            (r) =>
              ({
                projetoId: r.id_projeto,
                tituloProjeto: r.titulo_projeto,
                mes: mes || '',
              } as PendenciaMensal)
          )
        )
      );
  }

  confirmar(
    projetoId: number,
    dto: ConfirmarRelatorioMensalDTO
  ): Observable<{ id_relatorio: number; mensagem: string }> {
    return this.http.post<{ id_relatorio: number; mensagem: string }>(
      `${this.apiUrl}/${projetoId}/relatorios-mensais/confirmar`,
      dto
    );
  }

  baixarRelatorioAlunos() {
    return this.http.get(`${this.apiUrl}/relatorio-alunos`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  listarRecebidosSecretaria(mes?: string): Observable<RelatorioMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;

    return this.http
      .get<any[]>(`${this.apiUrl}/relatorios-mensais`, { params })
      .pipe(
        map((rows) =>
          (rows || []).map(
            (r) =>
              ({
                id: r.id_relatorio,
                projetoId: r.id_projeto,
                referenciaMes: r.mes,
                ok: !!r.ok,
                observacao: r.observacao ?? null,
                confirmadoEm: r.confirmado_em,
                tituloProjeto: r.titulo_projeto,
                orientadorNome: r.orientador_nome,
              } as RelatorioMensal)
          )
        )
      );
  }

  listarPendentesSecretaria(mes?: string): Observable<PendenciaMensal[]> {
    const params = mes ? new HttpParams().set('mes', mes) : undefined;

    return this.http
      .get<any[]>(`${this.apiUrl}/relatorios-mensais/pendentes`, { params })
      .pipe(
        map((rows) =>
          (rows || []).map(
            (r) =>
              ({
                projetoId: r.id_projeto,
                tituloProjeto: r.titulo_projeto,
                orientadorNome: r.orientador_nome,
                mes: r.mes || mes || '',
              } as PendenciaMensal)
          )
        )
      );
  }
}
