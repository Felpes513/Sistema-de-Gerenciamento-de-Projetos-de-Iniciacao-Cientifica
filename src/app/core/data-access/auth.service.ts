import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type Role = 'SECRETARIA' | 'ORIENTADOR' | 'ALUNO';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  setSession(access: string, refresh?: string): Role | null {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    const role = this.decodeRole(access);
    if (role) localStorage.setItem('role', role);
    return role as Role | null;
  }

  clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
  }

  getRole(): Role | null {
    return (localStorage.getItem('role') as Role) ?? null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: Role): boolean {
    return this.getRole() === role;
  }

  hasAnyRole(roles: Role[]): boolean {
    const r = this.getRole();
    return !!r && roles.includes(r);
  }

  redirectByRole(role?: Role | null): void {
    const r = role ?? this.getRole();
    switch (r) {
      case 'ORIENTADOR': this.router.navigate(['/orientador/projetos']); break;
      case 'SECRETARIA': this.router.navigate(['/secretaria/dashboard']); break;
      case 'ALUNO':      this.router.navigate(['/aluno/dashboard']); break;
      default:           this.router.navigate(['/']);
    }
  }

  private decodeRole(token: string): Role | null {
    try {
      const payload = JSON.parse(this.base64UrlDecode(token.split('.')[1] || ''));
      const raw: string | undefined = payload.role || payload.roles?.[0] || payload.authorities?.[0];
      if (!raw) return null;
      const upper = raw.toUpperCase();
      return (['ORIENTADOR', 'ALUNO', 'SECRETARIA'].includes(upper) ? (upper as Role) : null);
    } catch { return null; }
  }

  private base64UrlDecode(s: string): string {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
    return decodeURIComponent(
      atob(s + '='.repeat(pad))
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}
