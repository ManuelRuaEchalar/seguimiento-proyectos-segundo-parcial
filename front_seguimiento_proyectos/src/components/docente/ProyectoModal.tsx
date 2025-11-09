// components/modals/ProyectoModal.tsx
'use client';

import { useEffect } from 'react';
import Proyecto from '@/components/docente/Proyecto'; // Ajusta la ruta
import styles from './styles/ProyectoModal.module.css';

interface ProyectoModalProps {
  proyectoId: number;
  grupoId: number;
  onClose: () => void;
}

export default function ProyectoModal({ proyectoId, grupoId, onClose }: ProyectoModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // Bloquea scroll

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
        <div className={styles.modalContent}>
          <Proyecto proyectoId={proyectoId} grupoId={grupoId} />
        </div>
      </div>
    </div>
  );
}