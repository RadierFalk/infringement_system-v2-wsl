import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, catchError, throwError } from 'rxjs';

import * as AuthActions from '../../store/auth/auth.actions';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private tokenStorage: TokenStorageService,
    private store: Store,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.tokenStorage.getToken();

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Token ausente/expirado/inválido: encerra a sessão local e volta ao login.
        // Não trata 401 vindo da própria tela de login (evita loop).
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          this.store.dispatch(AuthActions.logout());
        }
        return throwError(() => error);
      }),
    );
  }
}
