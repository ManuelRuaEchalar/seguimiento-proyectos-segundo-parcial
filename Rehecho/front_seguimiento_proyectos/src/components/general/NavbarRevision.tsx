// NavbarRevision.tsx
import React from 'react';
import styles from './styles/NavbarRevision.module.css';

interface NavbarRevisionProps {
  role: 'docente' | 'estudiante' | 'estudiante_correccion';
  version: number;
  titulo: string;
  nombreEstudiante: string;
  codigoUniversitario: string;
  carrera: string;
}

const NavbarRevision: React.FC<NavbarRevisionProps> = ({
  role,
  version,
  titulo,
  nombreEstudiante,
  codigoUniversitario,
  carrera,
}) => {
  const handleGoBack = () => {
    console.log('Botón Atrás presionado');
  };

  const handleApprove = () => {
    console.log('Botón Aprobar Documento presionado');
  };

  const handleFinishCorrection = () => {
    console.log('Botón Terminar Corrección presionado');
  };

  return (
    <div className={styles.navbar}>
      {/* Navbar Left - Solo para docente y estudiante */}
      {(role === 'docente' || role === 'estudiante') && (
        <div className={styles.navbarLeft}>
          <button className={styles.backButton} onClick={handleGoBack}>
            ← Atrás
          </button>
        </div>
      )}

      {/* Navbar Center - Para todos los roles */}
      <div className={styles.navbarCenter}>
        <div className={styles.activityTitle}>
          <span className={styles.documentVersion}>Versión {version}</span>
          {titulo}
        </div>
        <div className={styles.activityMeta}>
          <span className={styles.activityDate}>
            {nombreEstudiante} • CU: {codigoUniversitario}
          </span>
          <span className={styles.tag}>{carrera}</span>
        </div>
      </div>

      {/* Navbar Right - Según el rol */}
      <div className={styles.navbarRight}>
        {role === 'docente' && (
          <button
            className={styles.approveButton}
            id="approve-button"
            onClick={handleApprove}
          >
            Aprobar Documento
          </button>
        )}
        {role === 'estudiante_correccion' && (
          <button
            className={styles.finishButton}
            id="finish-button"
            onClick={handleFinishCorrection}
          >
            Terminar Corrección
          </button>
        )}
      </div>
    </div>
  );
};

export default NavbarRevision;