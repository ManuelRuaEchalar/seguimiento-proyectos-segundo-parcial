// hooks/useAuthFetch.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAuthFetch<T = any>(endpoint: string, options: RequestInit = {}) {
  const { logout } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL no está definida');
        }

        const response = await fetch(`${apiUrl}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (response.status === 401) {
          logout();
          throw new Error('No autorizado');
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}
