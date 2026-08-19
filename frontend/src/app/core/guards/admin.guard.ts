import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, filter, map, take } from 'rxjs';

import { selectAuthLoading, selectIsAdmin } from '../../store/auth/auth.selectors';

/**
 * Diferente do AuthGuard, aqui precisamos do dado `is_admin`, que só existe
 * após o /auth/me responder — por isso aguardamos `selectAuthLoading` virar
 * false antes de decidir (evita negar acesso a um admin só porque o
 * carregamento do usuário ainda está em andamento).
 */
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([this.store.select(selectAuthLoading), this.store.select(selectIsAdmin)]).pipe(
      filter(([loading]) => !loading),
      take(1),
      map(([, isAdmin]) => isAdmin || this.router.createUrlTree(['/'])),
    );
  }
}
