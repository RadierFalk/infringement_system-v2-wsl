/** Espelha app/schemas/auth.py */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

/** Espelha o retorno de GET /auth/me em app/routes/auth_routes.py */
export interface CurrentUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  department: string | null;
}
