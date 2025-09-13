import DocumentCard from './DocumentCard';
import { Documento } from '@/types';

interface DocumentListProps {
  documentos: Documento[];
  onDocumentClick: (documento: Documento) => void;
}

export default function DocumentList({ documentos, onDocumentClick }: DocumentListProps) {
  if (documentos.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-7-3 7-3v6z" />
        </svg>
        <h4 className="empty-title">
          No hay documentos disponibles
        </h4>
        <p className="empty-description">
          Este proyecto aún no tiene documentos subidos.
        </p>
      </div>
    );
  }

  return (
    <div className="documents-grid">
      {documentos.map((documento) => (
        <DocumentCard 
          key={documento.codigoDoc} 
          documento={documento} 
          onDocumentClick={onDocumentClick}
        />
      ))}
    </div>
  );
}