'use client';

import styles from './styles/GrupoInfo.module.css';

interface GrupoInfoProps {
  grupo: {
    nombre: string;
    grado: string;
    fase: string;
  };
}

export default function GrupoInfo({ grupo }: GrupoInfoProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{grupo.nombre}</h1>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Grupo:</span> {grupo.nombre}
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Grado:</span> {grupo.grado}
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Fase:</span> {grupo.fase}
        </div>
      </div>
    </div>
  );
}