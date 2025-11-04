'use client';
import React from 'react';
import { Observacion } from '@/types/index';
import styles from './style/SidebarDerecha.module.css';

interface SidebarDerechaProps {
  observaciones: any[] | null;
  onObservationClick: (observacion: any) => void;
}

export default function SidebarDerecha({ observaciones, onObservationClick }: SidebarDerechaProps) {
  const getEstadoClass = (estado: string) => {
    const baseClass = styles.observacionEstado;
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return `${baseClass} ${styles.observacionEstadoAprobado}`;
      case 'rechazado':
        return `${baseClass} ${styles.observacionEstadoRechazado}`;
      case 'pendiente':
        return `${baseClass} ${styles.observacionEstadoPendiente}`;
      default:
        return baseClass;
    }
  };

  return (
    <aside className={styles.sidebarDerecha}>
      <div className={styles.logoContainer}>
        <div className={styles.logoPlaceholder}>
          <span>Observaciones a revisar</span>
        </div>
      </div>

      <div className={styles.sidebarDescription}>
        <h2 className={styles.sidebarTitle}>Observaciones</h2>
        <p className={styles.sidebarInstructions}>
          <small>Lista de observaciones asociadas al proyecto.</small>
        </p>
      </div>

      <ul className={styles.observaciones}>
        {observaciones && observaciones.length > 0 ? (
          observaciones.map((observacion) => (
            <li
              key={observacion.id}
              className={styles.observacion}
              onClick={() => onObservationClick(observacion)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <span className={getEstadoClass(observacion.estado)}>
                  {observacion.estado}
                </span>
                <br />
                {observacion.commentText && (
                  <strong className={styles.observacionComment}>{observacion.commentText}</strong>
                )}
                {observacion.contentText && (
                  <blockquote className={styles.observacionBlockquote}>
                    {`${observacion.contentText.slice(0, 90).trim()}…`}
                  </blockquote>
                )}
              </div>
              <div className={styles.observacionLocation}>Page {observacion.boundingPage}</div>
            </li>
          ))
        ) : (
          <li className={`${styles.observacion} ${styles.observacionEmpty}`}>
            No hay observaciones disponibles.
          </li>
        )}
      </ul>
    </aside>
  );
}