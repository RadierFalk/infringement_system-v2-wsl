import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { PaginatedResponse } from '../models/paginated-response.interface';

export interface Employee {
  id: number;
  name: string;
  username: string;
  email?: string;
  global_id?: string;
  company?: string;
  role?: string;
  department_id: number;
  is_admin: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  constructor(private api: ApiService) { }

  getAll(): Observable<PaginatedResponse<Employee>> {
    return this.api.get<PaginatedResponse<Employee>>('/employees/', {
      page: 1,
      size: 100,
    });
  }
}