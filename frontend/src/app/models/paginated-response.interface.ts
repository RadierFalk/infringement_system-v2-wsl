// Genérico porque TODA listagem paginada do backend (ocorrências,
// funcionários, departamentos...) usa exatamente esse mesmo formato de
// resposta: { items, total, page, size }. Em vez de repetir essa
// interface pra cada domínio, criamos uma vez e reutilizamos com <T>.
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}