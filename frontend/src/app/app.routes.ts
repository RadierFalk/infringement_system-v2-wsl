import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
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
        canActivate: [adminGuard],
        children: [
          { path: '', redirectTo: 'departments', pathMatch: 'full' },

          { path: 'departments', component: DepartmentsComponent },
          { path: 'employees', component: EmployeesComponent },
          { path: 'categories', component: CategoriesComponent },

          { path: 'occurrences', component: OccurrencesComponent },
          { path: 'occurrences/list', component: OccurrencesListComponent },
          { path: 'occurrences/add', component: OccurrenceAddComponent },
        ],
      },
    ],
  },

  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: '/not-found' },
];