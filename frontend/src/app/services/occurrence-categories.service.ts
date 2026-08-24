import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';

export interface OccurrenceCategory {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class OccurrenceCategoriesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<OccurrenceCategory[]> {
    return this.api.get<OccurrenceCategory[]>('/occurrence-categories/');
  }
}
