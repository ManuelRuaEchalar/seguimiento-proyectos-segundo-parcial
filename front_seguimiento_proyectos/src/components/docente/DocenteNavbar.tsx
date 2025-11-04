'use client';

import React from 'react';
import { useRouter } from 'next/navigation';  // <- AÑADIR ESTA LÍNEA
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
  const router = useRouter();  // <- AÑADIR ESTA LÍNEA

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* AÑADIR ESTE BLOQUE COMPLETO AQUÍ */}
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