'use client';

import React from 'react';
import styles from './styles/DocenteNavbar.module.css';

interface DocenteNavbarProps {
  nombreDocente: string;
  apellidoDocente: string;
  emailDocente: string;
  estudianteName: string;
  estudianteApellido: string;
  estudianteEmail: string;
  estudianteCU: string;
  carrera: string;
}

export default function DocenteNavbar({
  nombreDocente,
  apellidoDocente,
  emailDocente,
  estudianteName,
  estudianteApellido,
  estudianteCU,
  carrera,
}: DocenteNavbarProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.docenteSection}>
          <div className={styles.sectionTitle}>Información del Docente</div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Nombre:</span>
            <span className={styles.value}>{nombreDocente} {apellidoDocente}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{emailDocente}</span>
          </div>
        </div>

        <div className={styles.estudianteSection}>
          <div className={styles.sectionTitle}>Información del Estudiante</div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Nombre:</span>
            <span className={styles.value}>{estudianteName} {estudianteApellido}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>CU:</span>
            <span className={styles.value}>{estudianteCU}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Carrera:</span>
            <span className={styles.value}>{carrera}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}