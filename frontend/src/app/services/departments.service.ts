import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Department, DepartmentWithCount, DepartmentPayload } from 'src/app/models/department.interface';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  constructor(private api: ApiService) {}

  getAll(): Observable<DepartmentWithCount[]> {
    return this.api.get<DepartmentWithCount[]>('/departments/');
  }

  create(payload: DepartmentPayload): Observable<Department> {
    return this.api.post<Department>('/departments/', payload);
  }

  update(id: number, payload: DepartmentPayload): Observable<Department> {
    return this.api.put<Department>(`/departments/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/departments/${id}`);
  }
}