import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly apiUrlNotificacoes = `${this.apiUrl}/notificacoes`;

  constructor(private http: HttpClient) {}

  getNotificacoes(destinatario: string): Observable<any[]> {
    const params = new HttpParams()
      .set('destinatario', destinatario)
      .set('page', 1)
      .set('size', 1000);

     var teste = this.http
      .get<any>(this.apiUrlNotificacoes, { params })
      .pipe(map((res) => res.items ?? []));
    
    return teste;} 

  getNotificacoesPaginado(
    destinatario: string,
    page = 1,
    size = 10
  ): Observable<{ items: any[]; page: number; size: number; total: number }> {
    const params = new HttpParams()
      .set('destinatario', destinatario)
      .set('page', page)
      .set('size', size);

    return this.http.get<{
      items: any[];
      page: number;
      size: number;
      total: number;
    }>(this.apiUrlNotificacoes, { params });
  }

  marcarTodasComoLidas(dest: 'secretaria' | 'orientador' | 'aluno') {
    return this.http.put(`${this.apiUrlNotificacoes}/mark-all`, null, {
      params: { destinatario: dest },
    });
  }
}
