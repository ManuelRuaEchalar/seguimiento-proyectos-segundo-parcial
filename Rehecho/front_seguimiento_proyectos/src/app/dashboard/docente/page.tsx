'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentGroups, logout } from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';

export default function DocenteDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('docente');
  const [groups, setGroups] = useState<Group[]>([]);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (user && user.docente) {
      async function fetchGroups() {
        try {
          setFetchError('');
          const groupsData = await getStudentGroups();
          // Filter groups where the teacher is assigned
            const assignedGroups = groupsData.filter((group: Group) => group.docente_id === user?.docente?.id);
          setGroups(assignedGroups);
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : String(err));
        }
      }
      fetchGroups();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
        setFetchError(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (isUnauthorized) {
    return (
      <div>
        <h1>Usuario no autorizado 🚫</h1>
        <p>No tienes permiso para acceder a este panel.</p>
        {error && <p>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1>Panel de Docente 📚</h1>
        <p>Email: {user?.email}</p>
        {user?.docente?.especialidad && <p>Especialidad: {user.docente.especialidad}</p>}
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <div>
        <h2>Mis Grupos</h2>
        {fetchError && <p>{fetchError}</p>}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Grado</th>
              <th>Estudiantes</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rows = [];
              for (const group of groups) {
                const estudiantesNombres = [];
                if (group.estudiantes && group.estudiantes.length > 0) {
                  for (const estudiante of group.estudiantes) {
                    estudiantesNombres.push(`${estudiante.usuario.nombre || ''} ${estudiante.usuario.apellido || ''}`.trim());
                  }
                }
                const estudiantesTexto = estudiantesNombres.length > 0 ? estudiantesNombres.join(', ') : 'Sin estudiantes';
                rows.push(
                  <tr key={group.id}>
                    <td>{group.id}</td>
                    <td>{group.nombre}</td>
                    <td>{group.grado}</td>
                    <td>{estudiantesTexto}</td>
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}