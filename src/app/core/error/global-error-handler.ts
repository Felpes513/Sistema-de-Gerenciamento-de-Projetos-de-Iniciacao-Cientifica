import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';

interface NormalizedError {
  message: string;
  stack?: string | null;
  status?: number;
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const normalized = this.normalize(error);

    if (!environment.production) {
      console.error('[GlobalErrorHandler]', normalized, error);
    }

    if (environment.enableErrorLogging && environment.errorLoggingUrl) {
      void fetch(environment.errorLoggingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...normalized,
          url: location.href,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(() => {
      });
    }
  }

  private normalize(error: unknown): NormalizedError {
    if (error instanceof HttpErrorResponse) {
      return {
        message: error.message,
        stack: error.error?.stack || error.error?.trace || null,
        status: error.status,
      };
    }

    if (error instanceof Error) {
      return { message: error.message, stack: error.stack ?? null };
    }

    return { message: typeof error === 'string' ? error : 'Erro desconhecido' };
  }
}
