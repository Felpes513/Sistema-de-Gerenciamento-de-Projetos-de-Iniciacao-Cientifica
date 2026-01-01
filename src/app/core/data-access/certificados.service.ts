import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { SendEmailResponse } from '@shared/models/send-email-response.model';

@Injectable({ providedIn: 'root' })
export class CertificadoService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly relatoriosUrl = `${this.baseUrl}/relatorios`;
  private readonly sendEmailsUrl = `${this.baseUrl}/send-emails`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token_secretaria');

    if (!token) return new HttpHeaders();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro em CertificadoService', error);
    return throwError(() => error);
  }

  private getXlsx(url: string): Observable<HttpResponse<ArrayBuffer>> {
    return this.http
      .get(url, {
        headers: this.getAuthHeaders(),
        observe: 'response',
        responseType: 'arraybuffer',
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  baixarModeloExcelImportacaoAlunos(): Observable<HttpResponse<ArrayBuffer>> {
    return this.getXlsx(`${this.relatoriosUrl}/exportar-exemplo-excel`);
  }

  baixarRelatorioAlunos(): Observable<HttpResponse<ArrayBuffer>> {
    return this.getXlsx(`${this.relatoriosUrl}/relatorio-alunos`);
  }

  baixarRelatorioWorkshop(): Observable<HttpResponse<ArrayBuffer>> {
    return this.getXlsx(`${this.relatoriosUrl}/workshop`);
  }

  baixarCertificadosFinais(): Observable<HttpResponse<ArrayBuffer>> {
    return this.getXlsx(`${this.relatoriosUrl}/certificados`);
  }

  enviarArquivo(file: File): Observable<SendEmailResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post<SendEmailResponse>(this.sendEmailsUrl, formData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError((e) => this.handleError(e)));
  }
}
