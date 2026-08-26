export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
}

export type UserType = 'super_admin' | 'admin' | 'normal';

export interface UserInfo {
    id: number;
    name: string;
    username: string;
    email: string;
    user_type: UserType;
    department: string | null;
}