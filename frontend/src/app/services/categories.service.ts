import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import {
  OccurrenceCategory,
  OccurrenceCategoryPayload,
  SendingRule,
  SendingRulePayload,
} from '../models/occurrence-category.interface';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<OccurrenceCategory[]> {
    return this.api.get<OccurrenceCategory[]>('/occurrence-categories/');
  }

  create(payload: OccurrenceCategoryPayload): Observable<OccurrenceCategory> {
    return this.api.post<OccurrenceCategory>('/occurrence-categories/', payload);
  }

  update(id: number, payload: OccurrenceCategoryPayload): Observable<OccurrenceCategory> {
    return this.api.put<OccurrenceCategory>(`/occurrence-categories/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/occurrence-categories/${id}`);
  }

  addSendingRule(categoryId: number, payload: SendingRulePayload): Observable<SendingRule> {
    return this.api.post<SendingRule>(`/occurrence-categories/${categoryId}/sending-rules`, payload);
  }

  deleteSendingRule(categoryId: number, ruleId: number): Observable<void> {
    return this.api.delete<void>(`/occurrence-categories/${categoryId}/sending-rules/${ruleId}`);
  }
}