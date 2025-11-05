'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchFinal } from '@/services/finales';
import { VisualizadorPDFFinal } from '@/components/documento/VisualizadorPDFFinal';
import styles from './documento.module.css';

export default function RepositorioDocumentoPage() {
  const params = useParams();
  const router = useRouter();
  const documentoId = parseInt(params.id as string);

  const [state, setState] = useState<{
    blob: Blob | null;
    contentType: string;
    isLoading: boolean;
    error: string | null;
  }>({
    blob: null,
    contentType: 'application/pdf',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!documentoId || isNaN(documentoId)) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'ID de documento inválido',
      }));
      return;
    }

    async function cargarDocumento() {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        console.log('📄 Cargando documento ID:', documentoId);
        const documentoData = await fetchFinal(documentoId);
        console.log('✅ Documento cargado:', documentoData);

        setState({
          blob: documentoData.blob,
          contentType: documentoData.contentType,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('❌ Error cargando documento:', error);
        setState({
          blob: null,
          contentType: 'application/pdf',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error al cargar el documento',
        });
      }
    }

    cargarDocumento();
  }, [documentoId]);

  // 🆕 Mostrar estado de carga siempre visible
  if (state.isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f7fa'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid #e1e8ed',
          borderTopColor: '#2c3e50',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ marginTop: '1.5rem', color: '#2c3e50', fontSize: '1.125rem', fontWeight: 600 }}>
          Cargando documento ID: {documentoId}...
        </p>
      </div>
    );
  }

  if (state.error || !state.blob) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Error al cargar documento</h2>
          <p className={styles.errorMessage}>
            {state.error || 'No se pudo cargar el documento'}
          </p>
          <button 
            onClick={() => router.push('/')} 
            className={styles.backButton}
          >
            Volver al repositorio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={() => router.push('/')} 
          className={styles.backBtn}
          aria-label="Volver"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Atrás
        </button>
        <h1 className={styles.headerTitle}>Repositorio de Proyectos USFX</h1>
      </header>

      {/* Visualizador de PDF */}
      <div className={styles.viewerContainer}>
        <VisualizadorPDFFinal
          blob={state.blob}
          contentType={state.contentType}
        />
      </div>
    </div>
  );
}