import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class CoreModule {
  // Padrão clássico do Angular para módulos singleton: garante que o
  // CoreModule (e seus providers/interceptors) seja importado apenas uma
  // vez, no AppModule. Se um módulo lazy importar de novo, falha cedo aqui
  // em vez de duplicar o interceptor silenciosamente.
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule já foi carregado. Importe-o apenas no AppModule.');
    }
  }
}
