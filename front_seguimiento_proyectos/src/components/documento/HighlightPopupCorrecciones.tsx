import React from 'react';
import styles from './style/VisualizadorPDFCorrecciones.module.css';

interface HighlightPopupCorreccionesProps {
  comment: { 
    text: string; 
    emoji?: string 
  };
}

export const HighlightPopupCorrecciones: React.FC<HighlightPopupCorreccionesProps> = ({ comment }) =>
  comment.text ? (
    <div className={styles['highlight-popup']}>
      {comment.emoji && `${comment.emoji} `}{comment.text}
    </div>
  ) : null;