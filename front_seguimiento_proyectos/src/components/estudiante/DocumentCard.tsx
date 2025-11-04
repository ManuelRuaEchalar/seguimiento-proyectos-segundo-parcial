'use client';

import { useState } from 'react';
import { Document } from '@/services/documentos';
import styles from './styles/DocumentCard.module.css';

interface DocumentCardProps {
  documento: Document;
  version: number;
  onDocumentClick: (documento: Document) => void;
}

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En Revisión',
  revisado: 'Revisado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado'
};

export default function DocumentCard({ documento, version, onDocumentClick }: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mostrarJustificacionCompleta, setMostrarJustificacionCompleta] = useState(false);

  const getEstadoColor = () => {
    switch(documento.estado) {
      case 'aprobado': return '#005F73';
      case 'rechazado': return '#B91C1C';
      case 'en_revision': return '#171717';
      case 'revisado': return '#171717';
      case 'pendiente': return '#171717';
      default: return '#171717';
    }
  };

  const justificacionLarga = documento.justificacion && documento.justificacion.length > 150;

  return (
    <>
      <div 
        className={styles.container}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${styles.content} ${isHovered ? styles.hovered : ''}`}>
          <span className={styles.status} style={{ backgroundColor: getEstadoColor() }}>
            {estadoLabels[documento.estado] || documento.estado}
          </span>
          <div className={styles.title}>
            <h3 className={styles.titleText}>{documento.titulo}</h3>
            <p className={styles.version}>Versión {version}</p>
          </div>
          <button
            onClick={() => onDocumentClick(documento)}
            className={styles.button}
          >
            Ver
          </button>
        </div>
        {documento.justificacion && (
          <div className={styles.note}>
            <p className={styles.noteText}>
              {justificacionLarga ? `${documento.justificacion.substring(0, 150)}...` : documento.justificacion}
            </p>
            {justificacionLarga && (
              <button
                onClick={() => setMostrarJustificacionCompleta(true)}
                className={styles.noteButton}
              >
                Ver nota completa
              </button>
            )}
          </div>
        )}
      </div>
      {mostrarJustificacionCompleta && (
        <div className={styles.modal} onClick={() => setMostrarJustificacionCompleta(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Justificación del Docente</h3>
            <p className={styles.modalText}>{documento.justificacion}</p>
            <button
              onClick={() => setMostrarJustificacionCompleta(false)}
              className={styles.modalButton}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}