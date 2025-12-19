function resolveUrl(path: string): string {
  if (!path) {
    return '';
  }

  if (/^https?:/i.test(path)) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined' || !window.location?.origin) {
    return normalized;
  }

  const origin = window.location.origin.replace(/\/$/, '');
  return `${origin}${normalized}`;
}

export const environment = {
  production: true,

  apiBaseUrl: resolveUrl('/api'),

  ssoRedirectUrl: resolveUrl('/api/sso/redirect?provider=empresa'),

  exportAlunosBaseUrl: resolveUrl('/api/exportar-exemplo-excel'),

  emailApiBaseUrl: resolveUrl('/api/email-service'),

  enableErrorLogging: true,

  errorLoggingUrl: '',
};
