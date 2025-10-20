'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getStudentGroups, joinGroup, logout, getStudentProfile } from '@/services/api';
import { Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';
import styles from '../../../styles/EstudianteDashboard.module.css';

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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
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
      {/* Header con logo y info del usuario */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Image
            src="/images/EscudoUSFX (2).png"
            alt="Escudo USFX"
            width={100}
            height={100}
            className={styles.logo}
          />
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Panel de Estudiante</h1>
            <p className={styles.subtitle}>Selecciona un grupo para comenzar</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar Sesión
        </button>
      </header>

      <div className={styles.container}>
        {/* Card de información del usuario */}
        <div className={styles.userCard}>
          <div className={styles.userCardHeader}>
            <div className={styles.userAvatar}>
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <h2 className={styles.userName}>
                {user?.nombre} {user?.apellido}
              </h2>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <div className={styles.userInfo}>
            {user?.estudiante?.cu && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Carnet Universitario:</span>
                <span className={styles.infoValue}>{user.estudiante.cu}</span>
              </div>
            )}
            {user?.estudiante?.carrera && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Carrera:</span>
                <span className={styles.infoValue}>{user.estudiante.carrera}</span>
              </div>
            )}
          </div>
        </div>

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

        {/* Groups Section */}
        <div className={styles.groupsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Grupos Disponibles
            </h2>
            <span className={styles.badge}>{groups.length} grupo{groups.length !== 1 ? 's' : ''}</span>
          </div>

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
                    <div className={styles.groupCardHeader}>
                      <span className={styles.groupId}>#{group.id}</span>
                      <span className={styles.groupGrado}>
                        {group.grado === 'grado1' ? '1er Grado' : '2do Grado'}
                      </span>
                    </div>
                    <h3 className={styles.groupName}>{group.nombre}</h3>
                    <div className={styles.groupDocente}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{docenteTexto}</span>
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
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" y1="8" x2="19" y2="14"></line>
                            <line x1="22" y1="11" x2="16" y2="11"></line>
                          </svg>
                          Unirse al Grupo
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}