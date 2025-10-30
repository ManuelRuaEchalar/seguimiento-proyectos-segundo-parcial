// src/components/Pendiente.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Pendiente as PendienteType } from '@/types/types';
import { usePendientes } from '@/contexts/PendientesContext';
import styles from './styles/Pendiente.module.css';

interface PendienteProps {
  pendiente: PendienteType;
  onRevisar: (id: number) => void;
  bgColor: string;
}

const Pendiente: React.FC<PendienteProps> = ({ pendiente, onRevisar, bgColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { addPendiente } = usePendientes();

  const handleRevisar = () => {
    // Guardar en el caché antes de navegar
    addPendiente(pendiente);
    
    // Ejecutar el callback original
    onRevisar(pendiente.id);
    
    // Navegar a la página del documento
    router.push(`/dashboard/docente/documento/${pendiente.id}`);
  };

  return (
    <div 
      className={styles.pendiente}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${styles.leftSection} ${isHovered ? styles.hovered : ''}`}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>
            {pendiente.titulo}
          </h3>
        </div>
        <button 
          onClick={handleRevisar}
          className={styles.button}
        >
          Revisar
        </button>
      </div>
      <div 
        className={styles.rightSection} 
        style={{ backgroundColor: bgColor }}
      >
        <p className={styles.studentName}>
          {pendiente.estudiante}
        </p>
        <p className={styles.carrera}>
          {pendiente.carrera}
        </p>
        <p className={styles.cu}>
          CU: {pendiente.cu}
        </p>
      </div>
    </div>
  );
};

export default Pendiente;