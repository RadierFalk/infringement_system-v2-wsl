import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import * as AuthActions from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    // Restaura a sessão a partir do token salvo (se houver) antes de
    // qualquer guard avaliar acesso às rotas protegidas.
    this.store.dispatch(AuthActions.appInit());
  }
}
