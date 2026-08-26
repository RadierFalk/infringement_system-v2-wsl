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

  // Getter em vez de propriedade fixa: reavalia isAdmin() toda vez que
  // o Angular roda detecção de mudanças, então se o usuário mudar
  // (ex: outro login na mesma sessão de navegador) o menu se atualiza sozinho.
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate([APP_ROUTES.LOGIN]);
  }
}