// hooks/useAuthFetch.ts
import { useAuth } from '../context/AuthContext';

export const useAuthFetch = () => {
  const { logout } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Incluir cookies en todas las requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    logout();
  }

  return response;
};

  return { authFetch };
};