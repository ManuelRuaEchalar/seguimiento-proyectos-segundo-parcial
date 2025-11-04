'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { VisualizadorPDFTema } from './VisualizadorPDFTema';
import { changeProyectoFase } from '@/services/proyecto';
import { useRouter } from 'next/navigation';
import styles from './style/DocumentoLayoutClient.module.css';
import RevisionSidebar from './RevisionSidebar';
import RevisionHeader from '@/components/documento/RevisionHeader';

interface DatosDocumento {
  titulo: string;
  version: string;
  estado: string;
  fechaSubida: string;
  file: string;
}

interface DatosEstudiante {
  nombre: string;
  carrera: string;
  semestre: string;
}

interface DatosProyecto {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
}

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

export type EstadoRevision = 'pendiente' | 'aprobado' | 'rechazado';

interface DocumentoLayoutClientTemaProps {
  datosDocumento: DatosDocumento;
  datosEstudiante: DatosEstudiante;
  datosProyecto: DatosProyecto;
  blob: Blob;
  infoProyecto: infoProyecto;
  contentType: string;
  datosCache: any | null;
}

export default function DocumentoLayoutClientTema({
  blob,
  infoProyecto,
  contentType,
  datosCache,
}: DocumentoLayoutClientTemaProps) {
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [estado, setEstado] = useState<EstadoRevision>('pendiente');
  const [notaRechazo, setNotaRechazo] = useState<string>('');
  const router = useRouter();

  // Sincronizar el estado inicial con los datos del cache
  useEffect(() => {
    if (datosCache?.estado) {
      // Mapear el estado de la base de datos al estado del componente
      if (datosCache.estado === 'aprobado') {
        setEstado('aprobado');
      } else if (datosCache.estado === 'rechazado') {
        setEstado('rechazado');
        setNotaRechazo(datosCache.justificacion || '');
      } else {
        setEstado('pendiente');
      }
    }
  }, [datosCache]);

  const handleAprobar = useCallback(async () => {
    setEstado('aprobado');
    // Limpiar nota de rechazo si existe
    setNotaRechazo('');
  }, []);

  const handleRechazar = useCallback((nota: string) => {
    setEstado('rechazado');
    setNotaRechazo(nota);
  }, []);

  const handleRevisarDeNuevo = useCallback(() => {
    setEstado('pendiente');
    setNotaRechazo('');
  }, []);

  const handleSiguiente = useCallback(() => {
    router.push('/dashboard/docente');
  }, [router]);

  return (
    <div className={styles.documentoPageLayout}>
      {showInfoPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h3 className={styles.popupTitle}>Información de Visualización</h3>
            <p className={styles.popupText}>
              Este es el visor del documento actual.
            </p>
            <p className={styles.popupText}>
              La corrección del estudiante está resaltada de color <span className={styles.highlightStudent}>celeste</span> y la del docente de color <span className={styles.highlightTeacher}>piel</span>.
            </p>
            <button 
              className={styles.popupButton}
              onClick={() => setShowInfoPopup(false)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      <RevisionHeader 
        titulo={datosCache?.titulo || ''} 
        onVolver={() => router.back()}
      />

      <div className={styles.documentoBody}>
        <div className={`${styles.pdfContainer} ${styles.single}`}>
          <div className={styles.pdfViewerWrapper}>
            <VisualizadorPDFTema
              blob={blob}
              infoProyecto={infoProyecto}
              observaciones={[]}
              correcciones={[]}
            />
          </div>
        </div>

        <RevisionSidebar
          datosCache={datosCache}
          estado={estado}
          notaRechazo={notaRechazo}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          onRevisarDeNuevo={handleRevisarDeNuevo}
          onSiguiente={handleSiguiente}
        />
      </div>
    </div>
  );
}