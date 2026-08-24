import { Injectable } from '@angular/core';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_info';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  /**
   * Salva o token e os dados do usuário no storage correto,
   * e limpa o outro storage pra não deixar sessão duplicada/inconsistente.
   */
  setSession(token: string, userInfo: unknown, rememberMe: boolean): void {
    const target = rememberMe ? localStorage : sessionStorage;
    const other = rememberMe ? sessionStorage : localStorage;

    target.setItem(TOKEN_KEY, token);
    if (userInfo) target.setItem(USER_KEY, JSON.stringify(userInfo));

    other.removeItem(TOKEN_KEY);
    other.removeItem(USER_KEY);
  }

  updateUserInfo(userInfo: unknown): void {
    const target = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    target.setItem(USER_KEY, JSON.stringify(userInfo));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  getUserInfo<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  clear(): void {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
  }
}