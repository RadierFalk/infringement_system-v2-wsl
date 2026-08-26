import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-management',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.scss']
})
export class ManagementComponent {
    constructor(public authService: AuthService) {}

    get occurrencesLink(): string {
        // super_admin continua vendo a tile-page (Add/List);
        // admin vai direto pra List Occurrences, que é a única tela que ele pode usar.
        return this.authService.isSuperAdmin()? 'occurrences' : 'occurrences/list';
    }
}