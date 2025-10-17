'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDocenteWithGroups, logout } from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';
import styles from './page.module.css';

export default function DocenteDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('docente');
  const [groups, setGroups] = useState<Group[]>([]);
  const [docenteInfo, setDocenteInfo] = useState<any>(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
  if (user?.id && user.rol === 'docente') {
    async function fetchGroups() {
      try {
        setFetchError('');
        const data = await getDocenteWithGroups();
        
        if (data && typeof data === 'object' && 'docente' in data && 'groups' in data) {
          setDocenteInfo(data.docente);
          setGroups(data.groups || []);
        } else {
          setGroups(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error in fetchGroups:', err);
        setFetchError(err instanceof Error ? err.message : String(err));
      }
    }
    
    fetchGroups();
  }
}, [user?.id]); // Solo depender del ID

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
        setFetchError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleEstudianteClick = (estudianteId: number) => {
    router.push(`/dashboard/docente/proyecto/${estudianteId}`);
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
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Panel de Docente 📚</h1>
          <div className={styles.docenteInfo}>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Nombre:</strong> {docenteInfo?.usuario?.nombre} {docenteInfo?.usuario?.apellido}</p>
            <p><strong>Especialidad:</strong> {docenteInfo?.especialidad}</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>Cerrar Sesión</button>
      </div>

      <div className={styles.content}>
        {groups && groups.length > 0 ? (
          <>
            <h2>Mis Grupos ({groups.length})</h2>
            {fetchError && <p className={styles.errorMessage}>{fetchError}</p>}
            
            {groups.map((group) => (
              <div key={group.id} className={styles.groupCard}>
                <div className={styles.groupHeader}>
                  <h3>{group.nombre}</h3>
                  <p className={styles.gradoBadge}>Grado: {group.grado}</p>
                </div>
                
                <h4 className={styles.estudiantesTitle}>Estudiantes del Grupo</h4>
                {group.estudiantes && group.estudiantes.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.estudiantesTable}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Apellido</th>
                          <th>CU</th>
                          <th>Carrera</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.estudiantes.map((estudiante) => (
                          <tr 
                            key={estudiante.id}
                            className={styles.estudianteRow}
                            onClick={() => handleEstudianteClick(estudiante.id)}
                          >
                            <td>{estudiante.usuario.nombre}</td>
                            <td>{estudiante.usuario.apellido}</td>
                            <td>{estudiante.cu}</td>
                            <td>{estudiante.carrera}</td>
                            <td>
                              <button 
                                className={styles.viewProjectButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEstudianteClick(estudiante.id);
                                }}
                              >
                                Ver Proyecto
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={styles.noEstudiantes}>No hay estudiantes asignados a este grupo.</p>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <h2>Sin Grupos Asignados</h2>
            {fetchError && <p className={styles.errorMessage}>{fetchError}</p>}
            <p>No tienes ningún grupo asignado actualmente.</p>
          </>
        )}
      </div>
    </div>
  );
}