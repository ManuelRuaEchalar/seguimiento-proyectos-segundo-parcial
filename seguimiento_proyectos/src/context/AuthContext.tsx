// context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string; // Asegúrate de que esto esté incluido
  nombre: string;
  apellido: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar si hay un token al cargar la aplicación
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('API_URL en AuthContext:', apiUrl); // Log para debug
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL no está definida');
    }
    const response = await fetch(`${apiUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Respuesta en fetchUserData:', response.status); // Log

    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
    } else {
      console.error('Error en fetchUserData:', response.status);
      localStorage.removeItem('access_token');
      setUser(null);
    }
  } catch (error) {
    console.error('Error completo en fetchUserData:', error);
    localStorage.removeItem('access_token');
    setUser(null);
  }
};

const login = (token: string) => {
  localStorage.setItem('access_token', token);
  fetchUserData(token);
};

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
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