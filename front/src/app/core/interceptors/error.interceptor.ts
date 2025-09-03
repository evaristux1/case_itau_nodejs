// core/interceptors/error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  // const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expirado ou não autorizado
      if (error.status === 401) {
        authService.logout();
        return throwError(() => error);
      }

      // Extrai mensagem de erro da API
      const errorMessage = extractErrorMessage(error);
      // notificationService.showError(errorMessage);

      return throwError(() => error);
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return Array.isArray(error.error.message)
      ? error.error.message.join(', ')
      : error.error.message;
  }

  return error.status === 0
    ? 'Erro de conexão. Verifique sua internet.'
    : `Erro ${error.status}: ${error.statusText}`;
}
