import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
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
    this.router.navigate(['/login']);
  }
}