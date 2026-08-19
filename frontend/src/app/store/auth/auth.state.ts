import { CurrentUser } from '../../shared/models/auth.model';

export interface AuthState {
  user: CurrentUser | null;
  loading: boolean;
  /** true assim que o token é obtido; não implica que `user` já foi carregado */
  authenticated: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  authenticated: false,
  error: null,
};
