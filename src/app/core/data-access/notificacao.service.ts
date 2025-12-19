import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  // IMPORTANTE: barra final para evitar 307 (redirect) e Mixed Content em produção
  private readonly notificacoesUrl = `${this.apiBaseUrl}/notificacoes/`;

  constructor(private http: HttpClient) {}

  getNotificacoes(destinatario: string): Observable<any[]> {
    const params = new HttpParams()
      .set('destinatario', destinatario)
      .set('page', '1')
      .set('size', '1000');

    return this.http
      .get<any>(this.notificacoesUrl, { params })
      .pipe(map((res) => res.items ?? []));
  }

  getNotificacoesPaginado(
    destinatario: string,
    page = 1,
    size = 10
  ): Observable<{ items: any[]; page: number; size: number; total: number }> {
    const params = new HttpParams()
      .set('destinatario', destinatario)
      .set('page', String(page))
      .set('size', String(size));

    return this.http.get<{
      items: any[];
      page: number;
      size: number;
      total: number;
    }>(this.notificacoesUrl, { params });
  }

  marcarTodasComoLidas(dest: 'secretaria' | 'orientador' | 'aluno') {
    return this.http.put(`${this.notificacoesUrl}mark-all`, null, {
      params: { destinatario: dest },
    });
  }
}
