import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  Campus,
  Curso,
  TipoBolsa,
  BolsaCreateDto,
  BolsaListResponse,
} from '@shared/models/configuracao';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  listarCampus(): Observable<{ campus: Campus[] }> {
    return this.http.get<{ campus: Campus[] }>(`${this.apiUrl}/campus/`);
  }

  criarCampus(body: { campus: string }) {
    return this.http.post(`${this.apiUrl}/campus/`, body);
  }

  excluirCampus(id: number) {
    return this.http.delete(`${this.apiUrl}/campus/${id}`);
  }

  listarCursos(): Observable<{ cursos: Curso[] }> {
    return this.http.get<{ cursos: Curso[] }>(`${this.apiUrl}/cursos/`);
  }

  criarCurso(body: { nome: string }) {
    return this.http.post(`${this.apiUrl}/cursos/`, body);
  }

  excluirCurso(id: number) {
    return this.http.delete(`${this.apiUrl}/cursos/${id}`);
  }

  listarTiposBolsa(
    limit: number = 100,
    offset: number = 0
  ): Observable<TipoBolsa[]> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);

    return this.http.get<TipoBolsa[]>(`${this.apiUrl}/tipos-bolsa/`, {
      params,
    });
  }

  criarTipoBolsa(tipo_bolsa: string) {
    return this.http.post(`${this.apiUrl}/tipos-bolsa/`, { tipo_bolsa });
  }

  excluirTipoBolsa(id_tipo_bolsa: number) {
    return this.http.delete(`${this.apiUrl}/tipos-bolsa/${id_tipo_bolsa}`);
  }

  listarBolsas(
    limit: number = 100,
    offset: number = 0
  ): Observable<BolsaListResponse> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);

    return this.http.get<BolsaListResponse>(`${this.apiUrl}/bolsas/`, {
      params,
    });
  }

  criarBolsa(payload: BolsaCreateDto) {
    return this.http.post(`${this.apiUrl}/bolsas/`, payload);
  }

  excluirBolsa(id_bolsa: number) {
    return this.http.delete(`${this.apiUrl}/bolsas/${id_bolsa}`);
  }
}
