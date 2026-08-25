// Fonte única de verdade para os caminhos de navegação (usados em
// router.navigate([...]) e [routerLink]). Antes dessa etapa, o mesmo
// caminho '/dashboard' estava escrito literalmente em pelo menos 4
// arquivos diferentes (login, guest.guard, error.interceptor, sidebar).
// Quando renomeamos 'home' para 'dashboard' (Etapa 4), 2 desses lugares
// ficaram esquecidos e geraram um loop de redirecionamento — bug real
// que já corrigimos "na unha". Centralizando aqui, uma renomeação futura
// vira UMA mudança, e o TypeScript aponta erro de compilação em qualquer
// lugar que ainda use o import antigo, em vez de falhar silenciosamente
// em tempo de execução.
export const APP_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  OCCURRENCES_SEARCH: '/occurrences-search',
  ACCESS_DENIED: '/access-denied',
  MANAGEMENT: {
    ROOT: '/management',
    DEPARTMENTS: '/management/departments',
    EMPLOYEES: '/management/employees',
    CATEGORIES: '/management/categories',
    OCCURRENCES: '/management/occurrences',
  },
} as const;