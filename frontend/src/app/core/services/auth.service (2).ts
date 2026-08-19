import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CurrentUser, LoginRequest, Token } from '../../shared/models/auth.model';

/**
 * Encapsula as chamadas HTTP de app/routes/auth_routes.py.
 * Não guarda estado — o estado de sessão vive no NgRx store (store/auth).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<Token> {
    return this.http.post<Token>(`${this.baseUrl}/login`, credentials);
  }

  me(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.baseUrl}/me`);
  }
}
