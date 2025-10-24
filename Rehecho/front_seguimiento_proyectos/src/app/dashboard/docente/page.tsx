'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDocenteWithGroups, logout } from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';
import Navbar from '@/components/docente/Navbar';
import PendientesList from '@/components/docente/PendientesList';
import type { Docente, Pendiente } from '@/types/types';
import styles from './page.module.css';
import { fetchDocumentosPendientes } from '@/services/docentes';

export default function DocenteDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('docente');
  const [groups, setGroups] = useState<Group[]>([]);
  const [docenteInfo, setDocenteInfo] = useState<any>(null);
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [fetchError, setFetchError] = useState('');
  const [vistaActual, setVistaActual] = useState<'pendientes' | 'estudiantes'>('pendientes');
  const [pendienteActual, setPendienteActual] = useState<Pendiente | null>(null);

  useEffect(() => {
  if (user?.id && user.rol === 'docente') {
    async function fetchData() {
      try {
        setFetchError('');
        
        // Fetch groups
        const groupsData = await getDocenteWithGroups();
        if (groupsData && typeof groupsData === 'object' && 'docente' in groupsData && 'groups' in groupsData) {
          setDocenteInfo(groupsData.docente);
          setGroups(groupsData.groups || []);
        } else {
          setGroups(Array.isArray(groupsData) ? groupsData : []);
        }

        // Fetch pendientes and transform the data
        const pendientesResponse = await fetchDocumentosPendientes();
        if (pendientesResponse.success) {
          const transformedPendientes = pendientesResponse.data.map((pendiente: any) => ({
            id: pendiente.id,
            titulo: pendiente.titulo,
            fecha_creacion: pendiente.fecha_creacion,
            estudiante: pendiente.estudiantes[0]?.nombre_completo || 'Desconocido',
            cu: pendiente.estudiantes[0]?.cu || 'N/A',
            carrera: pendiente.estudiantes[0]?.carrera || 'N/A',
          }));
          setPendientes(transformedPendientes);
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setFetchError(err instanceof Error ? err.message : String(err));
      }
    }
    
    fetchData();
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

  const handleRevisar = (id: number) => {
    const pendiente = pendientes.find(p => p.id === id);
    if (pendiente) {
      setPendienteActual(pendiente);
    }
  };

  const handleVolver = () => {
    setPendienteActual(null);
  };

  const handleSiguiente = () => {
    if (pendienteActual) {
      const currentIndex = pendientes.findIndex(p => p.id === pendienteActual.id);
      const nextIndex = (currentIndex + 1) % pendientes.length;
      setPendienteActual(pendientes[nextIndex]);
    }
  };

  const prepareDocenteData = (): Docente | null => {
    if (!docenteInfo || !user) return null;

    return {
      nombre: `${docenteInfo.usuario?.nombre || ''} ${docenteInfo.usuario?.apellido || ''}`.trim(),
      correo: user.email || '',
      grupos: groups.map(group => group.nombre)
    };
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

  const docenteData = prepareDocenteData();

  return (
    <div className={styles.container}>
      {docenteData && <Navbar docente={docenteData} onLogout={handleLogout} />}

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.tabContainer}>
  <div className={styles.tabWrapper}>
    <button
      onClick={() => setVistaActual('pendientes')}
      className={`${styles.tabButton} ${
        vistaActual === 'pendientes' ? styles.active : styles.inactive
      }`}
    >
      Ver Pendientes
    </button>
    <button
      onClick={() => setVistaActual('estudiantes')}
      className={`${styles.tabButton} ${
        vistaActual === 'estudiantes' ? styles.active : styles.inactive
      }`}
    >
      Ver Estudiantes
    </button>
  </div>
</div>

          {fetchError && (
            <div className={styles.errorMessage}>
              <p>{fetchError}</p>
            </div>
          )}

          {vistaActual === 'pendientes' ? (
            <PendientesList 
              pendientes={pendientes}
              onRevisar={handleRevisar}
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}