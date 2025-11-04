import React, { useState } from 'react';
import styles from './style/RejectionForm.module.css';

interface RejectionFormProps {
  onReject: (comment: string) => void;
  onCancel: () => void;
}

export function RejectionForm({ onReject, onCancel }: RejectionFormProps) {
  const [comment, setComment] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setComment(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onReject(comment.trim());
      setComment('');
      setCharCount(0);
    }
  };

  const isCommentValid = comment.trim().length >= 10;

  return (
    <div className={styles.rejectionFormOverlay}>
      <div className={styles.rejectionForm}>
        <div className={styles.formHeader}>
          <div className={styles.iconContainer}>
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className={styles.formTitle}>Motivo del rechazo</h3>
          <p className={styles.formSubtitle}>
            Por favor, describa detalladamente el motivo del rechazo del documento
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.textareaContainer}>
            <textarea
              value={comment}
              onChange={handleTextChange}
              placeholder="Describa el motivo del rechazo. Mínimo 10 caracteres..."
              rows={6}
              required
              className={styles.rejectionTextarea}
              aria-label="Motivo del rechazo"
            />
            <div className={styles.charCounter}>
              <span className={charCount > maxChars * 0.9 ? styles.charWarning : ''}>
                {charCount}
              </span>
              <span className={styles.charMax}> / {maxChars}</span>
            </div>
          </div>

          {comment.trim().length > 0 && comment.trim().length < 10 && (
            <p className={styles.validationMessage}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              El motivo debe tener al menos 10 caracteres
            </p>
          )}

          <div className={styles.rejectionButtons}>
            <button 
              type="button" 
              onClick={onCancel} 
              className={styles.cancelBtn}
              aria-label="Cancelar rechazo"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Cancelar</span>
            </button>
            <button 
              type="submit" 
              className={styles.rejectBtn} 
              disabled={!isCommentValid}
              aria-label="Confirmar rechazo del documento"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>Confirmar Rechazo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}