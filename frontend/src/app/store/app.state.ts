import { AuthState } from './auth/auth.state';

/**
 * Slices adicionados nos próximos incrementos: employees, departments,
 * occurrenceCategories, occurrences, feedbacks.
 */
export interface AppState {
  auth: AuthState;
}
