import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Login fica FORA do shell: não deve ter sidebar.
  // guestGuard bloqueia acesso a essa rota se já houver sessão ativa.
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  {
    // Tudo que estiver em "children" é renderizado DENTRO do
    // <router-outlet> do ShellComponent, com a sidebar sempre visível.
    path: '',
    component: ShellComponent,

    // O guard aqui protege TODAS as rotas filhas de uma vez só —
    // não precisamos repetir canActivate: [authGuard] em cada uma.
    canActivate: [authGuard],

    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      // 'management' e 'occurrences-search' entram nas próximas etapas.
      // Se alguma exigir admin especificamente, adicionamos
      // canActivate: [adminGuard] só naquela rota filha, sem afetar as outras.
    ],
  },

  { path: '**', redirectTo: '/login' },
];