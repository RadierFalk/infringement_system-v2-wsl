import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { APP_ROUTES } from '../constants/routes.constants';

export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isSuperAdmin()) return true;
  router.navigate(authService.isLoggedIn() ? [APP_ROUTES.ACCESS_DENIED] : [APP_ROUTES.LOGIN]);
  return false;
};
