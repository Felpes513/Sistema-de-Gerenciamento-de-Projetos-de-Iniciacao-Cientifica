// D:\Projetos\Vs code\Sistema-de-Gerenciamento-de-Projetos-de-Iniciacao-Cientifica\src\app\services\avaliadores_externos.service.ts

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';

@Injectable({
  providedIn: 'root',
})
export class AvaliadoresExternosService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly apiUrlAvaliadoresExternos = `${this.apiUrl}/avaliadores-externos`;
  private readonly apiUrlProjetos = `${this.apiUrl}/projetos`;

  constructor(private http: HttpClient) {}

  // --- Helpers ---

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token_secretaria');

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro em AvaliadoresExternosService', error);
    return throwError(() => error);
  }

  // --- CRUD Avaliadores Externos ---

  criarAvaliador(a: AvaliadorExterno): Observable<{ id_avaliador: number }> {
    return this.http
      .post<{ id_avaliador: number }>(
        this.apiUrlAvaliadoresExternos,
        a,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  atualizarAvaliador(id: number, a: AvaliadorExterno): Observable<void> {
    return this.http
      .put<void>(
        `${this.apiUrlAvaliadoresExternos}/${id}`,
        a,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  listarAvaliadoresExternos(): Observable<AvaliadorExterno[]> {
    return this.http
      .get<AvaliadorExterno[]>(this.apiUrlAvaliadoresExternos, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  obterAvaliadorPorId(id: number): Observable<AvaliadorExterno> {
    return this.http
      .get<AvaliadorExterno>(`${this.apiUrlAvaliadoresExternos}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  deleteAvaliador(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrlAvaliadoresExternos}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  // --- Envio de projetos para avaliadores ---

  enviarProjetoParaAvaliadores(
    idProjeto: number,
    destinatarios: string[],
    mensagem?: string,
    assunto?: string
  ): Observable<{ mensagem: string }> {
    const body = { destinatarios, mensagem, assunto };

    return this.http
      .post<{ mensagem: string }>(
        `${this.apiUrlProjetos}/${idProjeto}/enviar`,
        body,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }
}
