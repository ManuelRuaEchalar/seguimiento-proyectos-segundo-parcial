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
  }, [user?.id]);

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
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Cargando panel del docente...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className={styles.container}>
        <div className={styles.noUserContainer}>
          <div className={styles.noUserContent}>
            <h1 className={styles.noUserTitle}>Usuario no autorizado 🚫</h1>
            <p className={styles.noUserMessage}>
              No tienes permiso para acceder a este panel.
            </p>
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Panel de Docente</h1>
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Nombre:</span>
                <span className={styles.value}>
                  {docenteInfo?.usuario?.nombre} {docenteInfo?.usuario?.apellido}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{user?.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Especialidad:</span>
                <span className={styles.value}>{docenteInfo?.especialidad || 'No especificada'}</span>
              </div>
              <div className={styles.detailItem}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.content}>
          {fetchError && (
            <div className={styles.errorMessage}>
              <p>{fetchError}</p>
            </div>
          )}

          {groups && groups.length > 0 ? (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Mis Grupos</h2>
                <span className={styles.groupCount}>{groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}</span>
              </div>
              
              {groups.map((group) => (
                <div key={group.id} className={styles.groupCard}>
                  <div className={styles.groupHeader}>
                    <div>
                      <h3 className={styles.groupName}>{group.nombre}</h3>
                      <span className={styles.gradoBadge}>Grado: {group.grado}</span>
                    </div>
                  </div>
                  
                  {group.estudiantes && group.estudiantes.length > 0 ? (
                    <div className={styles.estudiantesSection}>
                      <h4 className={styles.estudiantesTitle}>
                        Estudiantes ({group.estudiantes.length})
                      </h4>
                      <div className={styles.estudiantesGrid}>
                        {group.estudiantes.map((estudiante) => (
                          <div 
                            key={estudiante.id}
                            className={styles.estudianteCard}
                            onClick={() => handleEstudianteClick(estudiante.id)}
                          >
                            <div className={styles.estudianteHeader}>
                              <div className={styles.estudianteBadge}>
                                CU: {estudiante.cu}
                              </div>
                            </div>
                            <div className={styles.estudianteInfo}>
                              <p className={styles.estudianteNombre}>
                                {estudiante.usuario.nombre} {estudiante.usuario.apellido}
                              </p>
                              <p className={styles.estudianteCarrera}>
                                {estudiante.carrera}
                              </p>
                            </div>
                            <button 
                              className={styles.viewProjectButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEstudianteClick(estudiante.id);
                              }}
                            >
                              Ver Proyecto →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyTitle}>Sin estudiantes</p>
                      <p className={styles.emptyDescription}>
                        No hay estudiantes asignados a este grupo.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>Sin grupos asignados</p>
              <p className={styles.emptyDescription}>
                No tienes ningún grupo asignado actualmente.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}