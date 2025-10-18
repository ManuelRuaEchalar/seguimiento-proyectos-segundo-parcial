'use client';

import DocumentCard from '@/components/estudiante/DocumentCard';
import { Document } from '@/services/documentos';
import styles from './styles/DocumentList.module.css';

interface DocumentListProps {
  documentos: Document[];
  onDocumentClick: (documento: Document) => void;
}

export default function DocumentList({ documentos, onDocumentClick }: DocumentListProps) {
  // Ordenar documentos por fecha de creación (más nuevo primero)
  const sortedDocumentos = [...documentos].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calcular versiones (el más antiguo es v1, el más nuevo es v[length])
  const documentosConVersion = sortedDocumentos.map((doc, index) => ({
    ...doc,
    calculatedVersion: sortedDocumentos.length - index
  }));

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
      {documentosConVersion.map((documento) => (
        <DocumentCard 
          key={documento.id} 
          documento={documento} 
          version={documento.calculatedVersion}
          onDocumentClick={onDocumentClick}
        />
      ))}
    </div>
  );
}