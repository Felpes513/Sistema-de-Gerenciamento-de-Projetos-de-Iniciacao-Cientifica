import { inject } from '@angular/core';
import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';

const REFRESH_URL = '/api/refresh-token';

function normalizePath(u: string): string {
  try {
    return u.startsWith('http')
      ? new URL(u, window.location.origin).pathname
      : u;
  } catch {
    return u;
  }
}

type RefreshResponse = {
  access_token: string;
  token_type?: string;
};

let refreshInFlight$: Observable<string> | null = null;
let logoutInProgress = false;

function roleToPerfil(role: string | null | undefined): 'aluno' | 'orientador' | 'secretaria' | null {
  const r = String(role ?? '').toUpperCase();
  if (r === 'SECRETARIA') return 'secretaria';
  if (r === 'ORIENTADOR') return 'orientador';
  if (r === 'ALUNO') return 'aluno';
  return null;
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const backend = inject(HttpBackend);
  const rawHttp = new HttpClient(backend);

  const router = inject(Router);
  const auth = inject(AuthService);
  const dialog = inject(DialogService);

  const path = normalizePath(req.url);
  const isApi = path.startsWith('/api/');
  const isAuthEndpoint =
    path.startsWith('/api/login') ||
    path.startsWith('/api/login-') ||
    path.startsWith('/api/secretarias/login') ||
    path.startsWith('/api/forgot-password') ||
    path.startsWith('/api/reset-password') ||
    path === REFRESH_URL;

  const access = auth.getAccessToken();

  const authReq =
    access && isApi && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
      : req;

  const forceLogout = (msg: string) => {
    if (logoutInProgress) return;
    logoutInProgress = true;

    const currentRole = (typeof auth.getRole === 'function' ? auth.getRole() : null) ?? localStorage.getItem('role');
    const perfil = roleToPerfil(currentRole);

    const returnUrl = router.url || '/';

    auth.clearSession();

    void dialog
      .alert(msg, 'Sessão expirada')
      .catch(() => undefined)
      .then(() =>
        router.navigate(['/login'], {
          queryParams: {
            returnUrl,
            ...(perfil ? { perfil } : {}),
          },
        })
      )
      .finally(() => {
        setTimeout(() => (logoutInProgress = false), 0);
      });
  };

  return next(authReq).pipe(
    catchError((err: unknown) => {
      const httpErr = err as HttpErrorResponse;

      if (httpErr.status !== 401 || isAuthEndpoint) {
        return throwError(() => httpErr);
      }

      const refresh = localStorage.getItem('refresh_token');

      if (!refresh) {
        forceLogout('Sua sessão expirou ou foi invalidada. Faça login novamente.');
        return throwError(() => httpErr);
      }

      if (!refreshInFlight$) {
        const url = `${REFRESH_URL}?refresh_token=${encodeURIComponent(refresh)}`;

        refreshInFlight$ = rawHttp.post<RefreshResponse>(url, null).pipe(
          map((res) => {
            if (!res?.access_token) throw httpErr;
            localStorage.setItem('access_token', res.access_token);
            return res.access_token;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
          finalize(() => {
            refreshInFlight$ = null;
          })
        );
      }

      return refreshInFlight$.pipe(
        switchMap((newAccess) => {
          const retried = req.clone({
            setHeaders: { Authorization: `Bearer ${newAccess}` },
          });
          return next(retried);
        }),
        catchError((refreshErr: unknown) => {
          forceLogout('Sua sessão expirou. Faça login novamente.');
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
