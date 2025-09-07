// hooks/useAuthFetch.ts
import { useAuth } from '../context/AuthContext';

export const useAuthFetch = () => {
  const { user } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    return response;
  };

  return { authFetch };
};