import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ajuste o caminho se necessário

export const managementLandingGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const target = authService.isSuperAdmin() ? 'occurrences' : 'occurrences/list';
  return router.parseUrl(`/management/${target}`);
};