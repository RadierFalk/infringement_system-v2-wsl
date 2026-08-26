import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { APP_ROUTES } from '../constants/routes.constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenStorage.clear();
        router.navigate([APP_ROUTES.LOGIN]);
      }
      if (error.status === 403) {
        router.navigate([APP_ROUTES.ACCESS_DENIED]);
      }
      return throwError(() => error);
    })
  );
};
