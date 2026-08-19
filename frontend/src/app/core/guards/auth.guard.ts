import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';

/**
 * Checagem síncrona via TokenStorageService (localStorage), não via NgRx Store:
 * no primeiro carregamento da página o store ainda não foi hidratado
 * (loadCurrentUser é assíncrono), então depender do store aqui causaria
 * redirecionamento falso para /login em um refresh com sessão válida.
 * Um token inválido/expirado é tratado depois pelo AuthInterceptor (401 -> logout).
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.tokenStorage.hasToken()) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }
}
