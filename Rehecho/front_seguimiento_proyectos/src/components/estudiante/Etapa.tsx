'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/Etapa.module.css';

interface EtapaProps {
  faseActual: string;
  rol: 'docente' | 'estudiante';
  proyectoId?: number;
}

function getEtapas(rol: 'docente' | 'estudiante', proyectoId?: number) {
  const base =
    rol === 'docente'
      ? `/dashboard/docente/proyecto/${proyectoId}`
      : `/dashboard/estudiante/proyecto`;

  return [
    { id: 'tema', titulo: 'Tema', descripcion: 'Define el tema de tu proyecto', icono: '📋', ruta: `${base}/tema`, orden: 1 },
    { id: 'perfil', titulo: 'Perfil', descripcion: 'Desarrolla el perfil', icono: '📊', ruta: `${base}/perfil`, orden: 2 },
    { id: 'proyecto', titulo: 'Proyecto', descripcion: 'Elabora el proyecto final', icono: '🎯', ruta: `${base}/etapa-proyecto`, orden: 3 },
    { id: 'predefensa', titulo: 'Predefensa', descripcion: 'Presenta tu predefensa', icono: '🎤', ruta: `${base}/predefensa`, orden: 4 },
  ];
}

export default function Etapa({ faseActual, rol, proyectoId }: EtapaProps) {
  const router = useRouter();
  const etapas = getEtapas(rol, proyectoId);
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
        <p className={styles.subtitle}>Progresa a través de las diferentes etapas de tu proyecto</p>
      </div>
      <div className={styles.timelineContainer}>
        <div className={styles.progressLine}></div>
        <div className={styles.cardsGrid}>
          {etapas.map((etapa, index) => {
            const isCurrentOrCompleted = index <= faseActualIndex;
            const isActive = etapa.id === faseActual;
            const isFuture = index > faseActualIndex;

            return (
              <div key={etapa.id} className={`${styles.cardWrapper} ${isActive ? styles.active : ''}`}>
                <button
                  className={`${styles.card} ${
                    isCurrentOrCompleted ? styles.cardEnabled : styles.cardDisabled
                  } ${isActive ? styles.cardActive : ''}`}
                  onClick={() => handleEtapaClick(etapa)}
                  disabled={isFuture}
                >
                  <div className={styles.icono}>{etapa.icono}</div>
                  <div className={styles.content}>
                    <h3 className={styles.cardTitle}>{etapa.titulo}</h3>
                    <p className={styles.cardDescription}>{etapa.descripcion}</p>
                  </div>
                </button>
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
    </div>
  );
}
