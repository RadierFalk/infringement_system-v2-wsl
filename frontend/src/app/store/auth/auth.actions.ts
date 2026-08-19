import { createAction, props } from '@ngrx/store';

import { CurrentUser, LoginRequest } from '../../shared/models/auth.model';

export const login = createAction('[Auth] Login', props<{ credentials: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ token: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

/** Disparada no bootstrap da aplicação para restaurar a sessão a partir do token salvo. */
export const appInit = createAction('[Auth] App Init');

export const loadCurrentUser = createAction('[Auth] Load Current User');
export const loadCurrentUserSuccess = createAction(
  '[Auth] Load Current User Success',
  props<{ user: CurrentUser }>(),
);
export const loadCurrentUserFailure = createAction('[Auth] Load Current User Failure');

export const logout = createAction('[Auth] Logout');
