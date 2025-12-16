import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { ProjetoService } from '@services/projeto.service';

function fallbackByRole(auth: AuthService): string {
  const role = auth.getRole?.();
  if (role === 'SECRETARIA') return '/secretaria/projetos';
  if (role === 'ORIENTADOR') return '/orientador/projetos';
  if (role === 'ALUNO') return '/aluno/projetos';
  return '/';
}

export const projetoExistsGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const projetos = inject(ProjetoService);
  const rawId = route.paramMap.get('id') ?? route.paramMap.get('projetoId');
  const id = Number(rawId);

  if (!rawId || Number.isNaN(id) || id <= 0) {
    return router.createUrlTree([fallbackByRole(auth)], {
      queryParams: { invalidId: 1 },
    });
  }
  return projetos.getProjetoPorId(id).pipe(
    map(() => true),
    catchError((err: any) => {
      const status = Number(err?.status ?? err?.error?.status ?? 0);

      if (status === 404 || status === 403) {
        return of(
          router.createUrlTree([fallbackByRole(auth)], {
            queryParams: { from: state.url, blocked: 1, status },
          })
        );
      }
      return of(
        router.createUrlTree([fallbackByRole(auth)], {
          queryParams: { from: state.url, blocked: 1, status: status || 0 },
        })
      );
    })
  );
};
