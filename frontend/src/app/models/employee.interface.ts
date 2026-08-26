import { Department } from '../models/department.interface';

export type UserType = 'super_admin' | 'admin' | 'normal';
// Espelha EmployeeRead do backend. is_admin já vem como boolean aqui
// (a conversão de "Y"/"N" pra true/false é feita pelo backend, na
// função _to_employee_read do employee_routes.py — o frontend nunca
// precisa lidar com essa string).
export interface Employee {
    id: number;
    name: string;
    username: string;
    email?: string;
    global_id?: string;
    company?: string;
    role?: string;
    department_id: number;
    user_type: UserType;
    department?: Department;
}

// Formato esperado por POST/PUT. 'password' é opcional aqui no tipo,
// mas a obrigatoriedade em modo criação é validada no próprio formulário
// (ver EmployeeFormModalComponent), não nesta interface.
export interface EmployeePayload {
    name: string;
    username: string;
    email?: string;
    global_id?: string;
    company?: string;
    role?: string;
    department_id: number;
    password?: string;
    user_type: UserType;
}