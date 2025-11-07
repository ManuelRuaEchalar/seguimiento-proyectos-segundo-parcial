// NavbarRepositorio.tsx
import React from 'react';
import styles from './styles/NavbarRepositorio.module.css';
import { useRouter } from 'next/navigation';

interface NavbarRepositorioProps {
  titulo: string;
  carrera: string;
  estudiantes: string[]; // Array de nombres de estudiantes
}

const NavbarRepositorio: React.FC<NavbarRepositorioProps> = ({
  titulo,
  carrera,
  estudiantes,
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    console.log('Botón Atrás presionado - Regresando a raíz');
    router.push('');
  };

  return (
    <div className={styles.navbar}>
      {/* Navbar Left */}
      <div className={styles.navbarLeft}>
        <button className={styles.backButton} onClick={handleGoBack}>
          ← Atrás
        </button>
      </div>

      {/* Navbar Center */}
      <div className={styles.navbarCenter}>
        <div className={styles.activityTitle}>
          {titulo}
        </div>
        <div className={styles.activityMeta}>
          <span className={styles.activityDate}>
            {estudiantes.join(' • ')}
          </span>
          <span className={styles.tag}>{carrera}</span>
        </div>
      </div>

      {/* Navbar Right - Vacío para mantener la estructura */}
      <div className={styles.navbarRight}></div>
    </div>
  );
};

export default NavbarRepositorio;