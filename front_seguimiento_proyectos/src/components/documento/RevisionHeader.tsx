// src/components/RevisionHeader.tsx
import React from 'react';
import styles from './style/RevisionHeader.module.css';

interface RevisionHeaderProps {
  titulo: string;
  onVolver: () => void;
}

const RevisionHeader: React.FC<RevisionHeaderProps> = ({ 
  titulo, 
  onVolver 
}) => {

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <button onClick={onVolver} className={styles.backButton}>
            <img 
              src="/weui_back-filled.svg" 
              alt="Volver" 
              className={styles.backIcon}
            />
          </button>
          
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{titulo}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionHeader;