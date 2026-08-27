import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { APP_ROUTES } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  // Exposto como propriedade pública para o template poder usar
  // [routerLink]="routes.DASHBOARD" em vez de string literal.
  routes = APP_ROUTES;

  get userInfo() {
    return this.authService.getUserInfo();
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // "Gestão" agora aparece para super_admin e admin.
  get canSeeManagement(): boolean {
    return this.authService.isAdminOrAbove();
  }

  // Rótulo amigável em português para o papel do usuário.
  get userTypeLabel(): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Administrador',
      admin: 'Administrador',
      normal: 'Funcionário',
    };

    return labels[this.authService.getUserType() ?? ''] ?? '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate([APP_ROUTES.LOGIN]);
  }
}