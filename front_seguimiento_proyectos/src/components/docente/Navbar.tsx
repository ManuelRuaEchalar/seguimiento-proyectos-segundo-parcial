import React from 'react';
import type { Docente } from '@/types/types';
import styles from './styles/Navbar.module.css';

interface NavbarProps {
  docente: Docente;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ docente, onLogout }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarLetter}>
                {docente.nombre.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className={styles.docenteName}>{docente.nombre}</h1>
              <p className={styles.docenteRole}>Docente</p>
            </div>
          </div>
          
          <div className={styles.rightSection}>
            <div className={styles.groupsBadge}>
              <span className={styles.groupsText}>
                Grupos: {docente.grupos.join(", ")}
              </span>
            </div>
            
            <div className={styles.emailContainer}>
              <span className={styles.emailText}>{docente.correo}</span>
            </div>
            
            <button 
              className={styles.logoutButton} 
              title="Cerrar sesión"
              onClick={onLogout}
            >
              <img src="/logout.svg" alt="Logout" className={styles.logoutIcon} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;