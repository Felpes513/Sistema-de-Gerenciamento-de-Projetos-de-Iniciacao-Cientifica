import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SendEmailResponse } from '@interfaces/send-email-response.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly apiUrl = `${environment.apiBaseUrl}/send-emails`;

  constructor(private http: HttpClient) {}

  enviarArquivo(file: File): Observable<SendEmailResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<SendEmailResponse>(this.apiUrl, formData);
  }
}
