'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDocenteWithGroups, logout } from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';

export default function DocenteDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('docente');
  const [groups, setGroups] = useState<Group[]>([]);
  const [docenteInfo, setDocenteInfo] = useState<any>(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    if (user && user.rol === 'docente') {
      console.log('User is docente, calling fetchGroups');
      async function fetchGroups() {
        try {
          console.log('Starting fetchGroups function');
          setFetchError('');
          const data = await getDocenteWithGroups();
          console.log('Data received:', data);
          console.log('User object:', user);
          
          if (data && typeof data === 'object' && 'docente' in data && 'groups' in data) {
            setDocenteInfo(data.docente);
            setGroups(data.groups || []);
          } else {
            // If we get an array (old format), handle it
            setGroups(Array.isArray(data) ? data : []);
          }
        } catch (err) {
            console.error('Error in fetchGroups:', err);
            setFetchError(err instanceof Error ? err.message : String(err));
        }
      }
      fetchGroups();
    } else {
      console.log('User or user.rol is not docente, user:', user);
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
        <p>Nombre: {docenteInfo?.usuario?.nombre} {docenteInfo?.usuario?.apellido}</p>
        <p>Especialidad: {docenteInfo?.especialidad}</p>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <div>
        {groups && groups.length > 0 ? (
          <>
            <h2>Mis Grupos ({groups.length})</h2>
            {fetchError && <p style={{ color: 'red' }}>{fetchError}</p>}
            
            {groups.map((group) => (
              <div key={group.id} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>{group.nombre}</h3>
                <p><strong>Grado:</strong> {group.grado}</p>
                
                <h4>Estudiantes del Grupo</h4>
                {group.estudiantes && group.estudiantes.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nombre</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Apellido</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>CU</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Carrera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.estudiantes.map((estudiante) => (
                        <tr key={estudiante.id}>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{estudiante.usuario.nombre}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{estudiante.usuario.apellido}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{estudiante.cu}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{estudiante.carrera}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay estudiantes asignados a este grupo.</p>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <h2>Sin Grupos Asignados</h2>
            {fetchError && <p style={{ color: 'red' }}>{fetchError}</p>}
            <p>No tienes ningún grupo asignado actualmente.</p>
          </>
        )}
      </div>
    </div>
  );
}