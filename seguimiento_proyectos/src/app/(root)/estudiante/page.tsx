'use client';
import { useAuth } from '../../../context/AuthContext';
import { useAuthFetch } from '../../../hooks/useAuthFetch';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  nombre: string;
  email: string;
  // ... otras propiedades
}

const EstudiantePage = () => {
const { user } = useAuth();

if (!user) return <div>No hay datos de usuario</div>;

return (
  <div>
    <h1>Panel del Estudiante</h1>
    <p>Bienvenido: {user.nombre} registrado con email: {user.email}</p>
  </div>
);

};

export default EstudiantePage;