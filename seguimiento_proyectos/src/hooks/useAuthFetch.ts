// hooks/useAuthFetch.ts
import { useAuth } from '../context/AuthContext';

export const useAuthFetch = () => {
  const { logout } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    console.log("enviando datos a api:", url);
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      logout(); // Cerrar sesión si el token es inválido
    }

    return response;
  };

  return { authFetch };
};