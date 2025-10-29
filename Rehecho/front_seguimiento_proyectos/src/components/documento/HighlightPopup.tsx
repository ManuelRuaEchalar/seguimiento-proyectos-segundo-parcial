import React from 'react';
import styles from './style/VisualizadorPDF.module.css';

interface HighlightPopupProps {
  comment: { 
    text: string; 
    emoji?: string 
  };
}

export const HighlightPopup: React.FC<HighlightPopupProps> = ({ comment }) => {
  if (!comment.text) return null;

  return (
    <div className={styles.highlightPopup}>
      {comment.emoji && <span>{comment.emoji} </span>}
      {comment.text}
    </div>
  );
};