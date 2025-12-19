import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '@shared/models/login';
import { ResetPasswordDirectBody } from '@shared/models/login';
import { environment } from '@environments/environment';

type Role = 'SECRETARIA' | 'ORIENTADOR' | 'ALUNO';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  loginAluno(email: string, senha: string): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', senha);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(tap((res) => this.persistTokensFromResponse(res)));
  }

  loginOrientador(email: string, senha: string): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', senha);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login-orientador`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(tap((res) => this.persistTokensFromResponse(res)));
  }

  loginSecretaria(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/secretarias/login`, {
        email,
        senha,
      })
      .pipe(tap((res) => this.persistTokensFromResponse(res)));
  }

  private persistTokensFromResponse(res: Partial<LoginResponse>) {
    const access = (res as any)?.access_token || (res as any)?.token;
    const refresh = (res as any)?.refresh_token;

    if (!access) {
      throw new Error('Resposta de login sem access_token');
    }

    this.setTokens(access, refresh || '');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    const role = this.decodeRoleFromJwt(accessToken);
    if (role) {
      localStorage.setItem('role', role);
    }
  }

  getRole(): Role | null {
    const r = localStorage.getItem('role');
    return r === 'SECRETARIA' || r === 'ORIENTADOR' || r === 'ALUNO'
      ? (r as Role)
      : null;
  }

  private decodeRoleFromJwt(token: string): Role | null {
    try {
      const payload = JSON.parse(
        this.base64UrlDecode(token.split('.')[1] || '')
      );

      const raw =
        payload.perfil ||
        payload.role ||
        payload.roles?.[0] ||
        payload.authorities?.[0];

      if (!raw) return null;

      const upper = String(raw).toUpperCase();
      return ['SECRETARIA', 'ORIENTADOR', 'ALUNO'].includes(upper)
        ? (upper as Role)
        : null;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(s: string) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4 ? 4 - (s.length % 4) : 0;

    return decodeURIComponent(
      atob(s + '='.repeat(pad))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}
