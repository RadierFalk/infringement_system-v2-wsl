import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, switchMap, tap } from 'rxjs';

import { environment } from '../../environments/environment';

import { TokenStorageService } from '../core/services/token-storage.service';

import { LoginRequest, LoginResponse, UserInfo, UserType } from '../models/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  login(credentials: LoginRequest, rememberMe: boolean): Observable<UserInfo> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      // 1. Guarda o token (sem user_info ainda) pra poder autenticar a próxima chamada
      tap((response) => this.tokenStorage.setSession(response.access_token, null, rememberMe)),

      // 2. Agora que o token está salvo, o interceptor já consegue anexá-lo em /me
      switchMap(() => this.http.get<UserInfo>(`${this.authUrl}/me`)),

      // 3. Completa a sessão salvando os dados do usuário
      tap((userInfo) => this.tokenStorage.updateUserInfo(userInfo))
    );
  }

  logout(): void {
    this.tokenStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  getUserInfo(): UserInfo | null {
    return this.tokenStorage.getUserInfo<UserInfo>();
  }

  getUserType(): UserType | null {
    return this.getUserInfo()?.user_type ?? null;
  }

  // GA e Monitoria: cria/edita/apaga ocorrências, departamentos, categorias, funcionários
  isSuperAdmin(): boolean {
    return this.getUserType() === 'super_admin';
  }

  // RH, Jurídico, Presidentes: visualiza tudo + sugere modificações em qualquer departamento
  // (super_admin também "conta como" admin_or_above, por isso o OR aqui)
  isAdminOrAbove(): boolean {
    const type = this.getUserType();
    return type === 'super_admin' || type === 'admin';
  }

  // Gestores/Diretores: só o próprio departamento
  isNormal(): boolean {
    return this.getUserType() === 'normal';
  }
}