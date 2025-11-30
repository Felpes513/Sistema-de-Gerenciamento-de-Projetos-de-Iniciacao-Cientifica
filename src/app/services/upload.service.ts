import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SendEmailResponse } from '@interfaces/send-email-response.model';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  // ⚠️ Ajuste essa URL para o endpoint correto da sua API
  private apiUrl = 'http://localhost:8001/send-emails';

  constructor(private http: HttpClient) {}

  enviarArquivo(file: File): Observable<SendEmailResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<SendEmailResponse>(this.apiUrl, formData);
  }
}
