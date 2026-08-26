import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../core/constants/routes.constants';

@Component({
    selector: 'app-access-denied',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './access-denied.component.html',
    styleUrls: ['./access-denied.component.scss'],
})
export class AccessDeniedComponent {
    routes = APP_ROUTES;
}