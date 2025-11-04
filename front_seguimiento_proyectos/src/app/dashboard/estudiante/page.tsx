'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentGroups, joinGroup, getStudentProfile } from '@/services/api';
import { Group } from '@/types';
import { useAuthGuard } from '@/hooks/userAuthGuard';
import Navbar from '@/components/general/Navbar';
import styles from '@/styles/EstudianteDashboard.module.css';

export default function EstudianteDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('estudiante');
  const [groups, setGroups] = useState<Group[]>([]);
  const [fetchError, setFetchError] = useState('');
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      async function checkStudentProfile() {
        try {
          const profileData = await getStudentProfile();
          if (profileData.grupo) {
            setHasGroup(true);
            router.push('/dashboard/estudiante/proyecto');
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
      setJoiningGroupId(groupId);
      await joinGroup(groupId);
      router.push('/dashboard/estudiante/proyecto');
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
      setJoiningGroupId(null);
    }
  };

  if (isLoading || hasGroup === null) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Cargando...</p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>🚫</div>
          <h1 className={styles.errorTitle}>Usuario no autorizado</h1>
          <p className={styles.errorMessage}>
            No tienes permiso para acceder a este panel.
          </p>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
      </div>
    );
  }

  if (hasGroup) {
    return null;
  }

  return (
    <div className={styles.page}>
      {/* Navbar */}
      {user && (
        <Navbar
          role="estudiante"
          atras={false}
          estudianteInfo={{
            nombre: `${user.nombre} ${user.apellido}`,
            carrera: user.estudiante?.carrera || '',
            cu: user.estudiante?.cu || '',
            email: user.email,
          }}
        />
      )}

      {/* Error Alert */}
      {fetchError && (
        <div className={styles.alertError}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{fetchError}</span>
        </div>
      )}

      {/* Groups Grid - Directamente en el body */}
      {groups.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📂</div>
          <h3 className={styles.emptyStateTitle}>No hay grupos disponibles</h3>
          <p className={styles.emptyStateText}>
            Por favor, contacta con tu administrador para crear un grupo.
          </p>
        </div>
      ) : (
        <div className={styles.groupsGrid}>
          {groups.map((group) => {
            const docenteTexto = group.docente && group.docente.usuario 
              ? `${group.docente.usuario.nombre || ''} ${group.docente.usuario.apellido || ''}`.trim() 
              : 'Sin asignar';
            
            const isJoining = joiningGroupId === group.id;
            
            return (
              <div key={group.id} className={styles.groupCard}>
                <h3 className={styles.groupName}>{group.nombre}</h3>
                
                <div className={styles.groupDocente}>
                  <span>Asesor: {docenteTexto}</span>
                </div>
                
                <div className={styles.groupFooter}>
                  <span className={styles.groupGrado}>
                    {group.grado === 'grado1' ? '1er Grado' : '2do Grado'}
                  </span>
                  <span className={styles.activeBadge}>Activo</span>
                </div>
                
                <button 
                  onClick={() => handleJoinGroup(group.id)}
                  className={styles.joinButton}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Uniéndose...
                    </>
                  ) : (
                    'Unirse al grupo'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}