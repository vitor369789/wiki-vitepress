// Detectar URL da API baseado no ambiente
export function getApiUrl() {
  // Em produção, usar a mesma origem (servidor serve tudo)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  // Em desenvolvimento, usar localhost:3000
  return 'http://localhost:3000';
}

// Helper para fazer requisições autenticadas
export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint}`;
  
  console.log('🌐 API URL:', apiUrl);
  console.log('📡 Full URL:', url);
  
  const headers = {
    ...options.headers,
  };
  
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
}
