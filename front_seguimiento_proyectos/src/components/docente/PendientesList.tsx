// src/components/PendientesList.tsx
import React from 'react';
import type { Pendiente as PendienteType } from '@/types/types';
import Pendiente from './Pendiente';
import styles from './styles/PendientesList.module.css';

interface PendientesListProps {
  pendientes: PendienteType[];
  onRevisar: (id: number) => void;
}

const PendientesList: React.FC<PendientesListProps> = ({ pendientes, onRevisar }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Trabajos Pendientes
        </h2>
        <div className={styles.badge}>
          {pendientes.length}
        </div>
      </div>
      
      <div className={styles.listContainer}>
        {pendientes.map((pendiente) => (
          <Pendiente 
            key={pendiente.id} 
            pendiente={pendiente}
            onRevisar={onRevisar}
            bgColor="#1F2937"
          />
        ))}
      </div>
    </div>
  );
};

export default PendientesList;