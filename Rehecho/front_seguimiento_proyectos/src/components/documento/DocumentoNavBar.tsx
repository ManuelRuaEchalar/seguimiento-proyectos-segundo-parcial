// @/components/documento/DocumentoNavbar.tsx
'use client';
import React from 'react';
import styles from './style/DocumentoNavbar.module.css';

interface DocumentoNavbarProps {
  nombreDocumento: string;
  version: string;
  estado: string;
  fechaSubida: string;
}

export default function DocumentoNavbar({
  nombreDocumento,
  version,
  estado,
  fechaSubida,
}: DocumentoNavbarProps) {
  const handleVolver = () => {
    console.log('Botón volver clickeado');
    window.history.back();
  };

  const handleCompararVersion = () => {
    console.log('Botón comparar versión anterior clickeado');
    // Lógica para comparar versiones
  };

  const handleAprobar = () => {
    console.log('Botón aprobar clickeado');
    // Lógica para aprobar documento
  };

  const getEstadoClass = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('aprobado')) return styles.estadoAprobado;
    if (estadoLower.includes('revisión') || estadoLower.includes('revision')) return styles.estadoRevision;
    if (estadoLower.includes('pendiente')) return styles.estadoPendiente;
    if (estadoLower.includes('rechazado')) return styles.estadoRechazado;
    return styles.estadoDefault;
  };

  return (
    <nav className={styles.documentoNavbar}>
      <div className={styles.navbarLeft}>
        <button 
          onClick={handleVolver}
          className={styles.btnVolver}
          aria-label="Volver atrás"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Atrás</span>
        </button>
        <div className={styles.documentoInfo}>
          <span className={styles.nombreDocumento}>{nombreDocumento}</span>
          <span className={styles.version}>
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {version}
          </span>
        </div>
      </div>

      <div className={styles.navbarCenter}>
        <button 
          onClick={handleCompararVersion}
          className={styles.btnComparar}
          aria-label="Comparar con versión anterior"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>Comparar versión anterior</span>
        </button>
        <button 
          onClick={handleAprobar}
          className={styles.btnAprobar}
          aria-label="Aprobar documento"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Aprobar</span>
        </button>
      </div>

      <div className={styles.navbarRight}>
        <div className={styles.etiqueta}>
          <span className={styles.etiquetaLabel}>Estado:</span>
          <span className={`${styles.etiquetaValue} ${getEstadoClass(estado)}`}>
            {estado}
          </span>
        </div>
        <div className={styles.etiqueta}>
          <span className={styles.etiquetaLabel}>Fecha de subida:</span>
          <span className={styles.etiquetaValue}>
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {fechaSubida}
          </span>
        </div>
      </div>
    </nav>
  );
}