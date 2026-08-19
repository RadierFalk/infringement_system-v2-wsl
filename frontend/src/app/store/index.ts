import { ActionReducerMap } from '@ngrx/store';

import { authReducer } from './auth/auth.reducer';
import { AppState } from './app.state';

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
};
