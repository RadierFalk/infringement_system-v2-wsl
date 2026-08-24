import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requestCount = 0;
  // BehaviorSubject guarda o "último valor emitido" e entrega ele
  // imediatamente pra quem se inscrever depois
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.loadingSubject.asObservable();

  show(): void {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    // Math.max evita o contador ficar negativo em algum cenário de borda
    // (ex: hide() chamado sem show() correspondente por algum bug futuro).
    this.requestCount = Math.max(0, this.requestCount - 1);

    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }
}