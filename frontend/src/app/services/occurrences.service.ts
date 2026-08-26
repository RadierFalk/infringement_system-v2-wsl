import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { Occurrence } from '../models/occurrence.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

export interface OccurrenceFilters {
  filter?: string;
  status?: string;
  category_id?: number;
  page?: number;
  size?: number;
}

export interface OccurrenceCreate {
  title: string;
  description?: string;
  status?: string;
  date: string;
  employee_id: number;
  file_id?: number;
  category_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class OccurrencesService {
  constructor(private api: ApiService) {}

  getAll(
    filters: OccurrenceFilters = {},
  ): Observable<PaginatedResponse<Occurrence>> {
    return this.api.get<PaginatedResponse<Occurrence>>(
      '/occurrences/',
      filters,
    );
  }

  create(payload: OccurrenceCreate): Observable<Occurrence> {
    return this.api.post<Occurrence>('/occurrences/', payload);
  }
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/occurrences/${id}`);
  }
}