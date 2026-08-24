import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Occurrence } from 'src/app/models/occurrence.interface';
import { PaginatedResponse } from 'src/app/models/paginated-response.interface';

// Parâmetros aceitos pelo GET /occurrences/ do backend.
// Deixar isso tipado evita passar um filtro com nome errado sem perceber.
export interface OccurrenceFilters {
  filter?: string; // busca textual (alias de filter_text no backend)
  status?: string;
  category_id?: number;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class OccurrencesService {
  constructor(private api: ApiService) {}

  getAll(filters: OccurrenceFilters = {}): Observable<PaginatedResponse<Occurrence>> {
    return this.api.get<PaginatedResponse<Occurrence>>('/occurrences/', filters);
  }
}