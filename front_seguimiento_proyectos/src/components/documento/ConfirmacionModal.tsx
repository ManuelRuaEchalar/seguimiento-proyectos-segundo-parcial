// src/components/ConfirmacionModal.tsx
import React from 'react';
import styles from './style/ConfirmacionModal.module.css';

interface ConfirmacionModalProps {
  accion: 'aprobar' | 'rechazar';
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ConfirmacionModal: React.FC<ConfirmacionModalProps> = ({
  accion,
  onConfirmar,
  onCancelar
}) => {
  return (
    <div className={styles.overlay} onClick={onCancelar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          {accion === 'aprobar' ? (
            <div className={styles.iconAprobar}>✓</div>
          ) : (
            <div className={styles.iconRechazar}>!</div>
          )}
        </div>
        
        <div className={styles.content}>
          <h2 className={styles.title}>
            {accion === 'aprobar' ? 'Aprobar Tema' : 'Rechazar Tema'}
          </h2>
          <p className={styles.message}>
            {accion === 'aprobar' 
              ? 'Esta acción aprobará el tema presentado por el estudiante.' 
              : 'Esta acción rechazará el tema con la nota justificatoria proporcionada.'}
          </p>
        </div>
        
        <div className={styles.footer}>
          <button 
            onClick={onCancelar}
            className={styles.cancelarBtn}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirmar}
            className={accion === 'aprobar' ? styles.confirmarAprobarBtn : styles.confirmarRechazarBtn}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModal;