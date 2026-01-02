import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const alunoGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasRole('ALUNO')) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url, perfil: 'aluno' },
  });
};
