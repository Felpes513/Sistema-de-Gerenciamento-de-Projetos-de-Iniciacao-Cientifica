import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Injectable({ providedIn: 'root' })
export class LandingRedirectGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): true | UrlTree {
    const isLogged = typeof this.auth.isLoggedIn === 'function'
      ? this.auth.isLoggedIn()
      : !!this.auth.getRole?.();

    if (!isLogged) return true;

    const role = this.auth.getRole?.();
    if (!role) return true;

    const target =
      role === 'SECRETARIA'
        ? '/secretaria/projetos'
        : role === 'ORIENTADOR'
          ? '/orientador/projetos'
          : role === 'ALUNO'
            ? '/aluno/projetos'
            : '/login';

    return this.router.parseUrl(target);
  }
}
