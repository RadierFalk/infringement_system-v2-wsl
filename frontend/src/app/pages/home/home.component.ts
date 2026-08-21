import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

// Antes, esse componente controlava o próprio layout (padding, cor de
// fundo) e tinha o botão de logout embutido, porque era renderizado
// sozinho na tela. Agora que ele vive DENTRO do ShellComponent, o shell
// já cuida do layout ao redor e a sidebar já cuida do logout — então
// esse componente fica só com o que é responsabilidade dele: o conteúdo
// da própria tela de dashboard.
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Dashboard</h2>
      <p>Bem-vindo(a), {{ userInfo?.name }}.</p>
      <p><em>Os gráficos e cards reais entram na Etapa 4.</em></p>
    </div>
  `,
})
export class HomeComponent {
  userInfo = this.authService.getUserInfo();
  constructor(private authService: AuthService) {}
}