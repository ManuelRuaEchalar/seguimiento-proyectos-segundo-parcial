'use client';

import DocumentCard from '@/components/estudiante/DocumentCard';
import { Document } from '@/services/documentos';
import styles from './styles/DocumentList.module.css';

interface DocumentListProps {
  documentos: Document[];
  onDocumentClick: (documento: Document) => void;
}

export default function DocumentList({ documentos, onDocumentClick }: DocumentListProps) {
  if (documentos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-7-3 7-3v6z" />
        </svg>
        <h4 className={styles.emptyTitle}>
          No hay documentos disponibles
        </h4>
        <p className={styles.emptyDescription}>
          Este proyecto aún no tiene documentos subidos.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.documentsGrid}>
      {documentos.map((documento) => (
        <DocumentCard 
          key={documento.id} 
          documento={documento} 
          onDocumentClick={onDocumentClick}
        />
      ))}
    </div>
  );
}