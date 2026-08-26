import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';
import { Employee, EmployeePayload } from 'src/app/models/employee.interface';
import { PaginatedResponse } from 'src/app/models/paginated-response.interface';

export { Employee } from '../models/employee.interface';

export interface EmployeeFilters {
  filter?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  constructor(private api: ApiService) {}

  getAll(
    filters: EmployeeFilters = {},
  ): Observable<PaginatedResponse<Employee>> {
    return this.api.get<PaginatedResponse<Employee>>(
      '/employees/',
      filters,
    );
  }

  create(payload: EmployeePayload): Observable<Employee> {
    return this.api.post<Employee>('/employees/', payload);
  }

  update(id: number, payload: EmployeePayload): Observable<Employee> {
    return this.api.put<Employee>(`/employees/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/employees/${id}`);
  }
}