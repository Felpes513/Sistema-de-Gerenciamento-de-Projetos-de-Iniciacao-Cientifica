import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

type Perfil = 'aluno' | 'orientador' | 'secretaria';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  forgotPassword(email: string, perfil?: Perfil): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(
      `${this.apiUrl}/forgot-password`,
      { email, ...(perfil ? { perfil } : {}) },
      { headers: this.jsonHeaders }
    );
  }

  resetPassword(
    token: string,
    novaSenha: string,
    perfil?: Perfil
  ): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(
      `${this.apiUrl}/reset-password`,
      { token, nova_senha: novaSenha, ...(perfil ? { perfil } : {}) },
      { headers: this.jsonHeaders }
    );
  }
}
