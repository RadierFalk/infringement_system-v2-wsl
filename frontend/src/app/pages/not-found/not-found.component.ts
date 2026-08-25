import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../core/constants/routes.constants';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <a [routerLink]="routes.DASHBOARD" class="btn-primary">Voltar ao Dashboard</a>
    </div>
  `,
  styleUrls: ['../access-denied/access-denied.component.scss'], // reaproveita o mesmo estilo
})
export class NotFoundComponent {
  routes = APP_ROUTES;
}