import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
  ) {}

  /** POST /auth/login -> guarda o token e dispara o carregamento do usuário atual. */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((token) => AuthActions.loginSuccess({ token: token.access_token })),
          catchError(() =>
            of(AuthActions.loginFailure({ error: 'Usuário ou senha inválidos' })),
          ),
        ),
      ),
    ),
  );

  /** Persiste o token assim que o login é bem-sucedido e encadeia o /auth/me. */
  persistTokenAndLoadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ token }) => this.tokenStorage.setToken(token)),
      map(() => AuthActions.loadCurrentUser()),
    ),
  );

  /** Restaura a sessão no bootstrap da aplicação, se já existir token salvo. */
  appInit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.appInit),
      map(() =>
        this.tokenStorage.hasToken()
          ? AuthActions.loadCurrentUser()
          : AuthActions.loadCurrentUserFailure(),
      ),
    ),
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      exhaustMap(() =>
        this.authService.me().pipe(
          map((user) => AuthActions.loadCurrentUserSuccess({ user })),
          catchError(() => of(AuthActions.loadCurrentUserFailure())),
        ),
      ),
    ),
  );

  /** Token inválido/expirado ao carregar o usuário: limpa e volta pro login. */
  loadCurrentUserFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadCurrentUserFailure),
        tap(() => {
          this.tokenStorage.clear();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  loginSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadCurrentUserSuccess),
        tap(() => {
          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokenStorage.clear();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}
