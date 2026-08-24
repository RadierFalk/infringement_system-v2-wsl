import { Routes } from '@angular/router';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { ShellComponent } from 'src/app/layout/shell/shell.component';
import { ManagementComponent } from 'src/app/pages/management/management.component';
import { DepartmentsComponent } from 'src/app/pages/management/departments/departments.component';
import { EmployeesComponent } from './pages/management/employees/employees.component';
import { CategoriesComponent } from './pages/management/categories/categories.component';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { guestGuard } from 'src/app/core/guards/guest.guard';
import { adminGuard } from 'src/app/core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      {
        path: 'management',
        component: ManagementComponent,
        // adminGuard aqui protege TODA a área de gestão de uma vez:
        // um funcionário comum nem consegue entrar em /management,
        // muito menos em /management/departments.
        canActivate: [adminGuard],
        children: [
          { path: '', redirectTo: 'departments', pathMatch: 'full' },
          { path: 'departments', component: DepartmentsComponent },
          { path: 'employees', component: EmployeesComponent },
          { path: 'categories', component: CategoriesComponent },
          // 'occurrences' entra na próximas etapa
        ],
      },
    ],
  },

  { path: '**', redirectTo: '/login' },
];