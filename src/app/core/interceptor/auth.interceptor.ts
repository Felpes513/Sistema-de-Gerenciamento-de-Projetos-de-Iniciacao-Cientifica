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
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';

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

// ✅ 1 refresh por vez (tipado corretamente)
let refreshInFlight$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const backend = inject(HttpBackend);
  const rawHttp = new HttpClient(backend);

  const path = normalizePath(req.url);
  const isApi = path.startsWith('/api/');
  const isAuthEndpoint =
    path.startsWith('/api/login') ||
    path.startsWith('/api/login-') ||
    path.startsWith('/api/secretarias/login') ||
    path.startsWith('/api/forgot-password') ||
    path.startsWith('/api/reset-password') ||
    path === REFRESH_URL;

  const access = localStorage.getItem('access_token');

  const authReq =
    access && isApi && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      const httpErr = err as HttpErrorResponse;

      if (httpErr.status !== 401 || isAuthEndpoint) {
        return throwError(() => httpErr);
      }

      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        return throwError(() => httpErr);
      }

      // ✅ se já tem refresh rodando, só espera ele
      if (!refreshInFlight$) {
        refreshInFlight$ = rawHttp
          .post<RefreshResponse>(REFRESH_URL, { refresh_token: refresh })
          .pipe(
            map((res) => {
              if (!res?.access_token) throw httpErr;
              localStorage.setItem('access_token', res.access_token);
              return res.access_token; // <- string
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
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('role');
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
