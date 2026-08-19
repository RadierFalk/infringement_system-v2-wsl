import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CurrentUser } from '../../shared/models/auth.model';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  currentUser$: Observable<CurrentUser | null> = this.store.select(selectCurrentUser);

  constructor(private store: Store) {}
}
