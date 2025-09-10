// context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  nombre: string;
  apellido: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void; // Cambiado: ya no recibe token
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('API_URL en AuthContext:', apiUrl);
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL no está definida');
      }
      const response = await fetch(`${apiUrl}/users/me`, {
        credentials: 'include', // Incluir cookies
      });

      console.log('Respuesta en fetchUserData:', response.status);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Error en fetchUserData:', response.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Error completo en fetchUserData:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Ahora solo llamamos a fetchUserData, que usa las cookies
    fetchUserData();
  }, []);

  const login = () => {
    // Ahora login simplemente dispara la recarga de los datos del usuario
    fetchUserData();
  };

  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};