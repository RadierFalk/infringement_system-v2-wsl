import { createReducer, on } from '@ngrx/store';

import * as AuthActions from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state): AuthState => ({ ...state, loading: true, error: null })),

  on(AuthActions.loginSuccess, (state): AuthState => ({
    ...state,
    authenticated: true,
    loading: false,
  })),

  on(AuthActions.loginFailure, (state, { error }): AuthState => ({
    ...state,
    authenticated: false,
    loading: false,
    error,
  })),

  on(AuthActions.loadCurrentUser, (state): AuthState => ({ ...state, loading: true })),

  on(AuthActions.loadCurrentUserSuccess, (state, { user }): AuthState => ({
    ...state,
    user,
    authenticated: true,
    loading: false,
    error: null,
  })),

  on(AuthActions.loadCurrentUserFailure, (): AuthState => ({
    ...initialAuthState,
  })),

  on(AuthActions.logout, (): AuthState => ({
    ...initialAuthState,
  })),
);
