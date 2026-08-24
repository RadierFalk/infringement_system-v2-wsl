import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { OccurrencesComponent } from './pages/management/occurrences/occurrences.component';
import { OccurrenceAddComponent } from './pages/management/occurrences/add/occurrence-add.component';
import { OccurrencesListComponent } from './pages/management/occurrences/list/occurrences-list.component';

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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'management/occurrences', component: OccurrencesComponent },
      { path: 'management/occurrences/list', component: OccurrencesListComponent },
      { path: 'management/occurrences/add', component: OccurrenceAddComponent },
      // 'management' e 'occurrences-search' entram nas próximas etapas.
      // Se alguma exigir admin especificamente, adicionamos
      // canActivate: [adminGuard] só naquela rota filha, sem afetar as outras.
    ],
  },

  { path: '**', redirectTo: '/login' },
];