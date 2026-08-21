export const environment = {
  // BASE DA API, sem barra final
  production: false,
  apiUrl: 'http://localhost:8000',
  // Rotas de autenticação ficam FORA do prefixo /api (particularidade do backend)
    // Todas as outras rotas de domínio (departments, employees, occurrences...) usam /api 
};
