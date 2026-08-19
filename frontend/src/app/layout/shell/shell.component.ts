import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as AuthActions from '../../store/auth/auth.actions';
import { CurrentUser } from '../../shared/models/auth.model';
import { selectCurrentUser, selectIsAdmin } from '../../store/auth/auth.selectors';

interface NavLink {
  label: string;
  icon: string;
  route: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  currentUser$: Observable<CurrentUser | null> = this.store.select(selectCurrentUser);
  isAdmin$: Observable<boolean> = this.store.select(selectIsAdmin);

  // Rotas dos demais recursos serão adicionadas nos próximos incrementos
  // (occurrences, employees, departments, occurrence-categories, feedbacks).
  navLinks: NavLink[] = [
    { label: 'Início', icon: 'home', route: '/home', adminOnly: false },
  ];

  constructor(private store: Store) {}

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
