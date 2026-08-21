import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

// ShellComponent é o "layout" das telas autenticadas: sidebar fixa +
// área de conteúdo que troca de acordo com a rota ativa. Ele NUNCA
// é usado na tela de login — login fica fora dessa estrutura (ver app.routes.ts).
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, LoadingComponent],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {}