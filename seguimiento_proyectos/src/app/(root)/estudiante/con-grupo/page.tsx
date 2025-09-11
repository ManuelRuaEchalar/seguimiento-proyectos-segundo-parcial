'use client';
import { useAuth } from '../../../../context/AuthContext';
import { useAuthFetch } from '../../../../hooks/useAuthFetch';
import { useEffect, useState } from 'react';


const EstudianteConGrupoPage = () => {
const { user } = useAuth();
console.log(user);

if (!user) return <div>No hay datos de usuario</div>;

return (
  <div>
    <h1>Panel del Estudiante</h1>
    <p>
  Bienvenido: {user.nombre}&nbsp;{user.apellido} registrado con email: {user.email}
</p>
    <p>
  Estas programado en el grupo {user.grupo_id}
</p>

  </div>
);

};

export default EstudianteConGrupoPage;