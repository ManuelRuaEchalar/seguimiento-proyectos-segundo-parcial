import React from 'react';
import styles from './style/NotaCompletaModal.module.css';

interface NotaCompletaModalProps {
  nota: string;
  onCerrar: () => void;
}

const NotaCompletaModal: React.FC<NotaCompletaModalProps> = ({ nota, onCerrar }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Nota de Rechazo</h2>
        <div className={styles.notaContainer}>
          <p className={styles.notaTexto}>{nota}</p>
        </div>
        <button onClick={onCerrar} className={styles.cerrarBtn}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default NotaCompletaModal;