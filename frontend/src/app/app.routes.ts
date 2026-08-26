import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';
import { adminOrAboveGuard } from './core/guards/admin-or-above.guard';
import { managementLandingGuard } from './core/guards/management-landing.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

import { ManagementComponent } from './pages/management/management.component';
import { DepartmentsComponent } from './pages/management/departments/departments.component';
import { EmployeesComponent } from './pages/management/employees/employees.component';
import { CategoriesComponent } from './pages/management/categories/categories.component';
import { OccurrencesSearchComponent } from './pages/occurrences-search/occurrences-search.component';

import { OccurrencesComponent } from './pages/management/occurrences/occurrences.component';
import { OccurrenceAddComponent } from './pages/management/occurrences/add/occurrence-add.component';
import { OccurrencesListComponent } from './pages/management/occurrences/list/occurrences-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'access-denied', component: AccessDeniedComponent, canActivate: [authGuard] },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'occurrences-search', component: OccurrencesSearchComponent },

      {
        path: 'management',
        component: ManagementComponent,
        canActivate: [adminOrAboveGuard],
        children: [
          // O guard decide o destino: super_admin -> occurrences, admin -> occurrences/list.
          // Precisa de um component aqui só porque o Angular exige um para a rota existir;
          // ele nunca chega a renderizar, pois o guard sempre redireciona antes.
          { path: '', pathMatch: 'full', component: OccurrencesListComponent, canActivate: [managementLandingGuard] },

          // Só super_admin
          { path: 'departments', component: DepartmentsComponent, canActivate: [superAdminGuard] },
          { path: 'employees', component: EmployeesComponent, canActivate: [superAdminGuard] },
          { path: 'categories', component: CategoriesComponent, canActivate: [superAdminGuard] },

          // Tile-page (Add/List) só faz sentido pra quem pode Add -> só super_admin
          { path: 'occurrences', component: OccurrencesComponent, canActivate: [superAdminGuard] },

          // super_admin e admin podem ver a lista de ocorrências
          { path: 'occurrences/list', component: OccurrencesListComponent },

          // Criar ocorrência continua só super_admin
          { path: 'occurrences/add', component: OccurrenceAddComponent, canActivate: [superAdminGuard] }
        ],
      },
    ],
  },

  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: '/not-found' },
];