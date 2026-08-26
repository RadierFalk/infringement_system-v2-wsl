// Espelha DepartmentBase do backend (name, manager_email, director_name).
export interface Department {
  id: number;
  name: string;
  manager_email?: string;
  director_name?: string;
}

// O GET /api/departments/ do backend usa o schema DepartmentWithCount,
// que adiciona employee_count — por isso é uma interface separada,
// em vez de deixar employee_count opcional dentro de Department.
export interface DepartmentWithCount extends Department {
  employee_count: number;
}

// Formato que POST/PUT esperam. Sem 'id' (o backend gera) e sem
// 'employee_count' (isso é calculado, não algo que o usuário edita).
export interface DepartmentPayload {
  name: string;
  manager_email?: string;
  director_name?: string;
}