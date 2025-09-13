import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface VisualizadorPDFProps {
  blob: Blob | null;
  contentType?: string;
}

const VisualizadorPDF: React.FC<VisualizadorPDFProps> = ({ blob, contentType }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convertir blob a URL para react-pdf
  const pdfUrl = blob ? URL.createObjectURL(blob) : null;

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError('Error al cargar el PDF');
    setLoading(false);
    console.error('Error loading PDF:', error);
  }, []);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
  };

  if (!blob) {
    return (
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-error">
          No hay archivo PDF para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      {/* Barra de herramientas */}
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-section">
          <button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            className="pdf-btn pdf-btn-nav"
            title="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="pdf-page-info">
            Página {pageNumber} de {numPages || 0}
          </span>
          
          <button 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1)}
            className="pdf-btn pdf-btn-nav"
            title="Página siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="pdf-toolbar-section">
          <button 
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="pdf-btn pdf-btn-zoom"
            title="Alejar"
          >
            <ZoomOut size={18} />
          </button>
          
          <span className="pdf-zoom-info">
            {Math.round(scale * 100)}%
          </span>
          
          <button 
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="pdf-btn pdf-btn-zoom"
            title="Acercar"
          >
            <ZoomIn size={18} />
          </button>
          
          <button 
            onClick={rotate}
            className="pdf-btn pdf-btn-rotate"
            title="Rotar"
          >
            ↻
          </button>
          
          <button 
            onClick={resetView}
            className="pdf-btn pdf-btn-reset"
            title="Restablecer vista"
          >
            Restablecer
          </button>
        </div>
      </div>

      {/* Contenedor del PDF */}
      <div className="pdf-document-container">
        {loading && (
          <div className="pdf-loading">
            <div className="pdf-spinner"></div>
            <span>Cargando PDF...</span>
          </div>
        )}

        {error && (
          <div className="pdf-viewer-error">
            {error}
          </div>
        )}

        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="pdf-document"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="pdf-page"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default VisualizadorPDF;