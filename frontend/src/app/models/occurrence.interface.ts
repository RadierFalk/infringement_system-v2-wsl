// Espelha exatamente o schema OccurrenceRead do backend (Pydantic).
// Manter os nomes de campo idênticos ao JSON que a API devolve evita
// ter que fazer "tradução" manual de nomes em cada service.

// Os valores do enum precisam bater EXATAMENTE com as strings que o
// backend envia (ver backend/app/models/occurrence.py -> StatusEnum).
export enum StatusEnum {
  CREATED = 'Created',
  SENT = 'Sent',
  RESPONSE_RECEIVED = 'Response received',
  RESPONSE_REJECTED = 'Response rejected',
  RESOLVED = 'Resolved',
}

// Versão resumida do funcionário, só com o que o backend aninha
// dentro de OccurrenceRead.employee — não precisamos do objeto
// Employee completo aqui.
export interface OccurrenceEmployee {
  id: number;
  name: string;
  username: string;
}

export interface OccurrenceCategory {
  id: number;
  name: string;
}

export interface Occurrence {
  id: number;
  title: string;
  description?: string;
  status: StatusEnum;
  date: string; // vem como string ISO do backend; convertida pra Date só na hora de exibir
  employee_id: number;
  employee: OccurrenceEmployee;
  file_id?: number;
  category_id?: number;
  category?: OccurrenceCategory;
}