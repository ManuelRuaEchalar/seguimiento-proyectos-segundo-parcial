'use client';

import { useRouter } from 'next/navigation';
import styles from '@/components/estudiante/styles/Header.module.css';

interface HeaderProps {
  user: {
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  } | null;
  grupo_id?: string;
  proyecto_id?: string;
}

export default function Header({ user, grupo_id = "1", proyecto_id = "1" }: HeaderProps) {
  const router = useRouter();

  if (!user) {
    return (
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLoading}>
            <div className={styles.loadingSpinner}></div>
            <span>Cargando...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Botón de regresar */}
        <button 
          onClick={() => router.back()} 
          className={styles.backButton}
          aria-label="Volver atrás"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Avatar e información del usuario */}
        <div className={styles.headerUserSection}>
          <div className={styles.userAvatar}>
            <span className={styles.avatarInitials}>
              {user.nombre.charAt(0)}{user.apellido.charAt(0)}
            </span>
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.headerTitle}>{user.nombre} {user.apellido}</h1>
            <p className={styles.headerSubtitle}>{user.email}</p>
          </div>
        </div>

        {/* Información del grupo */}
        <div className={styles.headerGroupSection}>
          <div className={styles.groupBadge}>
            <span className={styles.groupNumber}>Grupo {grupo_id}</span>
            <span className={styles.projectTitle}>Proyecto #{proyecto_id}</span>
          </div>
        </div>
      </div>
    </header>
  );
}