'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentGroups, joinGroup, logout, getStudentProfile } from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';

export default function EstudianteDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('estudiante');
  const [groups, setGroups] = useState<Group[]>([]);
  const [fetchError, setFetchError] = useState('');
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      async function checkStudentProfile() {
        try {
          const profileData = await getStudentProfile();
          if (profileData.grupo) {
            setHasGroup(true);
            router.push('/dashboard/estudiante/proyecto'); // Redirige si ya tiene grupo
          } else {
            setHasGroup(false);
            const groupsData = await getStudentGroups();
            setGroups(groupsData);
          }
        } catch (err) {
          setFetchError(err instanceof Error ? err.message : String(err));
          setHasGroup(false);
        }
      }
      checkStudentProfile();
    }
  }, [user, router]);

  const handleJoinGroup = async (groupId: number) => {
    try {
      setFetchError('');
      await joinGroup(groupId);
      router.push('/dashboard/estudiante/proyecto'); // Redirige tras unirse a un grupo
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading || hasGroup === null) {
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

  if (hasGroup) {
    return null; // La redirección ya ocurrió
  }

  return (
    <div>
      <div>
        <h1>Panel de Estudiante 📚</h1>
        <p>Email: {user?.email}</p>
        {user?.estudiante?.cu && <p>CU: {user.estudiante.cu}</p>}
        {user?.estudiante?.carrera && <p>Carrera: {user.estudiante.carrera}</p>}
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <div>
        <h2>Grupos Disponibles</h2>
        {fetchError && <p>{fetchError}</p>}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Grado</th>
              <th>Docente</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const docenteTexto = group.docente && group.docente.usuario 
                ? `${group.docente.usuario.nombre || ''} ${group.docente.usuario.apellido || ''}`.trim() 
                : 'Sin asignar';
              return (
                <tr key={group.id}>
                  <td>{group.id}</td>
                  <td>{group.nombre}</td>
                  <td>{group.grado}</td>
                  <td>{docenteTexto}</td>
                  <td>
                    <button onClick={() => handleJoinGroup(group.id)}>
                      Unirse
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}