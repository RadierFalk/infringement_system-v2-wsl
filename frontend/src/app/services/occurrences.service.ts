import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Occurrence, OccurrencePayload } from 'src/app/models/occurrence.interface';
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

// Formato de resposta de POST /{id}/send-notification — não é uma
// ocorrência, é um resumo do envio (quem recebeu, se enviou de fato).
export interface SendNotificationResult {
  sent: boolean;
  to: string[];
  cc: string[];
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OccurrencesService {
  constructor(private api: ApiService) {}

  getAll(filters: OccurrenceFilters = {}): Observable<PaginatedResponse<Occurrence>> {
    return this.api.get<PaginatedResponse<Occurrence>>('/occurrences/', filters);
  }

  create(payload: OccurrencePayload): Observable<Occurrence> {
    return this.api.post<Occurrence>('/occurrences', payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/occurrences/${id}`);
  }

  sendNotification(id: number): Observable<SendNotificationResult> {
    return this.api.post<SendNotificationResult>(`/occurrences/${id}/send-notification`, {});
  }
}