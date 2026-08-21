export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
}

export interface UserInfo {
    id: number;
    name: string;
    username: string;
    email: string;
    is_admin: boolean;
    department: string | null;
}