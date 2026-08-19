import { Injectable } from '@angular/core';

const TOKEN_KEY = 'infringement_access_token';

/**
 * Isola o acesso ao localStorage. O interceptor HTTP lê o token daqui de
 * forma síncrona (evita depender do NgRx Store, que é assíncrono, para
 * decidir se anexa o header Authorization em cada requisição).
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
