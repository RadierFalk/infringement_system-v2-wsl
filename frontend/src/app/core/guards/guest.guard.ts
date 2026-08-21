import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Guarda o caminho inverso do authGuard: protege a tela de LOGIN.
 * Se o usuário já tem uma sessão válida (token salvo), não faz sentido
 * mostrar o formulário de login de novo — manda direto pra home.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};