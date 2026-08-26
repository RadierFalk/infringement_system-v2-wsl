// src/app/core/interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// Interceptor que liga/desliga o loading global automaticamente
// em TODA requisição HTTP que passar pelo HttpClient — nenhum
// componente precisa gerenciar isso manualmente.
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  loadingService.show();

  return next(req).pipe(
    // finalize() roda TANTO em sucesso quanto em erro (diferente de
    // um .subscribe({ next: ... }) que só rodaria no caminho feliz).
    // Isso garante que o spinner sempre desliga, mesmo se a requisição
    // falhar com erro de rede ou 500.
    finalize(() => loadingService.hide())
  );
};