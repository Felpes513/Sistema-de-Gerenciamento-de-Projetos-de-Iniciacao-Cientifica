import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';

export const orientadorGuard: CanActivateFn = (
  route,
  state
): boolean | UrlTree => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const isReadonly =
    state.url.includes('readonly=1') || route.queryParamMap.has('readonly');
  const isSecretaria = auth.hasRole('SECRETARIA');
  if (isReadonly && isSecretaria) return true;

  if (auth.isLoggedIn() && auth.hasRole('ORIENTADOR')) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url, perfil: 'orientador' },
  });
};
