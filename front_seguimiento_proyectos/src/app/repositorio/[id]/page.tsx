'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchFinal } from '@/services/finales';
import { VisualizadorPDFFinal } from '@/components/documento/VisualizadorPDFFinal';
import NavbarRepositorio from '@/components/general/NavbarRepositorio';
import styles from './documento.module.css';

export default function RepositorioDocumentoPage() {
  const params = useParams();
  const router = useRouter();
  const documentoId = parseInt(params.id as string);

  const [state, setState] = useState<{
    blob: Blob | null;
    contentType: string;
    titulo: string;
    carrera: string;
    estudiantes: string[];
    isLoading: boolean;
    error: string | null;
  }>({
    blob: null,
    contentType: 'application/pdf',
    titulo: '',
    carrera: '',
    estudiantes: [],
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
          titulo: documentoData.titulo,
          carrera: documentoData.carrera,
          estudiantes: documentoData.estudiantes,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('❌ Error cargando documento:', error);
        setState({
          blob: null,
          contentType: 'application/pdf',
          titulo: '',
          carrera: '',
          estudiantes: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error al cargar el documento',
        });
      }
    }

    cargarDocumento();
  }, [documentoId]);

  // Estado de carga mejorado
  if (state.isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>
          Cargando documento ID: {documentoId}...
        </p>
      </div>
    );
  }

  // Estado de error mejorado
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
      {/* Navbar responsive */}
      <NavbarRepositorio 
        titulo={state.titulo || "Proyecto de Investigación"}
        carrera={state.carrera || "Carrera no especificada"}
        estudiantes={state.estudiantes}
      />

      {/* Visualizador de PDF responsive */}
      <div className={styles.viewerContainer}>
        <VisualizadorPDFFinal
          blob={state.blob}
          contentType={state.contentType}
        />
      </div>
    </div>
  );
}