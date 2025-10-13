'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/Etapa.module.css';

interface EtapaProps {
  faseActual: string;
}

export default function Etapa({ faseActual }: EtapaProps) {
  const router = useRouter();

  const etapas = [
    {
      id: 'tema',
      titulo: 'Tema',
      descripcion: 'Define el tema de tu proyecto',
      icono: '📋',
      ruta: '/dashboard/estudiante/proyecto/tema',
      orden: 1,
    },
    {
      id: 'perfil',
      titulo: 'Perfil',
      descripcion: 'Desarrolla el perfil del proyecto',
      icono: '📊',
      ruta: '/dashboard/estudiante/proyecto/perfil',
      orden: 2,
    },
    {
      id: 'proyecto',
      titulo: 'Proyecto',
      descripcion: 'Elabora el proyecto final',
      icono: '🎯',
      ruta: '/dashboard/estudiante/proyecto/etapa-proyecto',
      orden: 3,
    },
    {
      id: 'predefensa',
      titulo: 'Predefensa',
      descripcion: 'Presenta tu predefensa',
      icono: '🎤',
      ruta: '/estudiante/predefensa',
      orden: 4,
    },
  ];

  const faseActualIndex = etapas.findIndex((e) => e.id === faseActual);

  const handleEtapaClick = (etapa: typeof etapas[0]) => {
    if (etapa.orden <= faseActualIndex + 1) {
      router.push(etapa.ruta);
    }
  };

  return (
    <div className={styles.etapaContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Etapas del Proyecto</h2>
        <p className={styles.subtitle}>
          Progresa a través de las diferentes etapas de tu proyecto
        </p>
      </div>

      <div className={styles.timelineContainer}>
        {/* Línea de progreso */}
        <div className={styles.progressLine}></div>

        <div className={styles.cardsGrid}>
          {etapas.map((etapa, index) => {
            const isCurrentOrCompleted = index <= faseActualIndex;
            const isFuture = index > faseActualIndex;
            const isActive = etapa.id === faseActual;

            return (
              <div
                key={etapa.id}
                className={`${styles.cardWrapper} ${
                  isActive ? styles.active : ''
                }`}
              >
                <button
                  className={`${styles.card} ${
                    isCurrentOrCompleted
                      ? styles.cardEnabled
                      : styles.cardDisabled
                  } ${isActive ? styles.cardActive : ''}`}
                  onClick={() => handleEtapaClick(etapa)}
                  disabled={isFuture}
                  title={
                    isFuture
                      ? 'Debes completar las etapas anteriores'
                      : `Ir a ${etapa.titulo}`
                  }
                >
                  <div className={styles.icono}>{etapa.icono}</div>
                  <div className={styles.content}>
                    <h3 className={styles.cardTitle}>{etapa.titulo}</h3>
                    <p className={styles.cardDescription}>
                      {etapa.descripcion}
                    </p>
                  </div>
                  <div
                    className={`${styles.statusIndicator} ${
                      isActive ? styles.statusActive : ''
                    } ${isCurrentOrCompleted ? styles.statusCompleted : ''}`}
                  >
                    {isActive && <span className={styles.statusDot}></span>}
                    {isCurrentOrCompleted && !isActive && (
                      <span className={styles.statusCheck}>✓</span>
                    )}
                  </div>
                </button>

                {/* Conectores entre cards */}
                {index < etapas.length - 1 && (
                  <div
                    className={`${styles.connector} ${
                      isCurrentOrCompleted ? styles.connectorActive : ''
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          Tu etapa actual es <strong>{faseActual.toUpperCase()}</strong>. El
          docente debe aprobar tu progreso para acceder a las siguientes etapas.
        </p>
      </div>
    </div>
  );
}