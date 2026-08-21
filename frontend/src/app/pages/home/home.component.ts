import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; color: white; font-family: sans-serif;">
      <h2>✅ Login bem-sucedido</h2>
      <p>Nome: {{ userInfo?.name }}</p>
      <p>Usuário: {{ userInfo?.username }}</p>
      <p>Admin: {{ userInfo?.is_admin }}</p>
      <p>Departamento: {{ userInfo?.department }}</p>
      <button (click)="logout()">Sair</button>
    </div>
  `,
})
export class HomeComponent {
  userInfo = this.authService.getUserInfo();
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
