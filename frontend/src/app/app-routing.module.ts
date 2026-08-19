import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './layout/home/home.component';
import { ShellComponent } from './layout/shell/shell.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomeComponent },
      // Próximos incrementos (lazy, com AdminGuard onde aplicável):
      // { path: 'occurrences', loadChildren: () => import('./features/occurrences/occurrences.module')... },
      // { path: 'employees', canActivate: [AdminGuard], loadChildren: () => ... },
      // { path: 'departments', canActivate: [AdminGuard], loadChildren: () => ... },
      // { path: 'occurrence-categories', canActivate: [AdminGuard], loadChildren: () => ... },
      // { path: 'feedbacks', loadChildren: () => ... },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
