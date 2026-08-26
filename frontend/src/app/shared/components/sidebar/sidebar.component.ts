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

  constructor(private authService: AuthService, private router: Router) {}

  // "Gestão" agora aparece pra super_admin E admin (regra que a gente definiu:
  // admin entra na área de management, mesmo só podendo ver/sugerir).
  get canSeeManagement(): boolean {
    return this.authService.isAdminOrAbove();
  }

  // Rótulo amigável em português pro papel do usuário — o valor guardado
  // internamente continua sendo 'super_admin'/'admin'/'normal', só a
  // exibição na tela é traduzida aqui.
  get userTypeLabel(): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Adiministrador',
      admin: 'Administrador',
      normal: 'Funcionario',
    };
    return labels[this.authService.getUserType() ?? ''] ?? '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate([APP_ROUTES.LOGIN]);
  }
}