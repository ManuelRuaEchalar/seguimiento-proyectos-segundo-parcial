'use client';

import { Document } from '@/services/documentos';
import styles from './styles/DocumentCard.module.css';

interface DocumentCardProps {
  documento: Document;
  version: number; // Versión calculada
  onDocumentClick: (documento: Document) => void;
}

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En Revisión',
  revisado: 'Revisado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado'
};

const estadoColors: Record<string, string> = {
  pendiente: styles.estadoPendiente,
  en_revision: styles.estadoEnRevision,
  revisado: styles.estadoRevisado,
  aprobado: styles.estadoAprobado,
  rechazado: styles.estadoRechazado
};

export default function DocumentCard({ documento, version, onDocumentClick }: DocumentCardProps) {
  const filename = documento.file.split('/').pop() || documento.titulo;

  return (
    <button
      onClick={() => onDocumentClick(documento)}
      className={styles.documentCard}
      aria-label={`Abrir documento ${documento.titulo} versión ${version}`}
    >
      <div className={styles.documentHeader}>
        <div className={styles.documentBadge + ' ' + styles.documentVersion}>
          v{version}
        </div>
        <div className={`${styles.documentBadge} ${estadoColors[documento.estado]}`}>
          {estadoLabels[documento.estado] || documento.estado}
        </div>
      </div>
      
      <h3 className={styles.documentTitle}>
        {documento.titulo}
      </h3>

      <div className={styles.documentMeta}>
        <span className={styles.fase}>
          Fase: {documento.fase.charAt(0).toUpperCase() + documento.fase.slice(1)}
        </span>
      </div>
      
      <div className={styles.documentInfo}>
        <div className={styles.fileInfo}>
          <svg className={styles.fileIcon} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <span className={styles.fileName}>{filename}</span>
          <svg className={styles.externalIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </button>
  );
}