// src/app/dashboard/docente/documento/[id]/DocumentoWrapper.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import DocumentoPageClient from './DocumentoPageClient';
import DocumentoLayoutClient from '@/components/documento/DocumentoLayoutClient';
import DocumentoLayoutClientTema from '@/components/documento/DocumentoLayoutClientTema';
import { fetchProyectoById } from '@/services/proyecto';
import type { Pendiente as PendienteType } from '@/types/types';

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

interface ProyectoCompleto {
  fase_actual: string;
  [key: string]: any;
}

interface DocumentoWrapperProps {
  documentoId: number;
  datosDocumento: DatosDocumento;
  datosEstudiante: DatosEstudiante;
  datosProyecto: DatosProyecto;
  observaciones: any[];
  observacionesProyecto: any[];
  correcciones: any[];
  blob: Blob;
  infoProyecto: infoProyecto;
  contentType: string;
}

export default function DocumentoWrapper({
  documentoId,
  datosDocumento,
  datosEstudiante,
  datosProyecto,
  observaciones,
  observacionesProyecto,
  correcciones,
  blob,
  infoProyecto,
  contentType,
}: DocumentoWrapperProps) {
  const [datosCache, setDatosCache] = useState<PendienteType | null>(null);
  const [proyectoCompleto, setProyectoCompleto] = useState<ProyectoCompleto | null>(null);
  const [loadingProyecto, setLoadingProyecto] = useState(true);
  const [errorProyecto, setErrorProyecto] = useState<string | null>(null);

  const handleDataLoaded = useCallback((data: PendienteType | null) => {
    setDatosCache(data);
  }, []);

  useEffect(() => {
    async function obtenerProyecto() {
      try {
        setLoadingProyecto(true);
        const data = await fetchProyectoById(infoProyecto.codigoProyecto);
        setProyectoCompleto(data.proyecto);
        console.log('Datos completos del proyecto:', data.proyecto);
      } catch (error: any) {
        console.error('Error al obtener el proyecto:', error);
        setErrorProyecto(error.message || 'Error al cargar el proyecto');
      } finally {
        setLoadingProyecto(false);
      }
    }

    if (infoProyecto?.codigoProyecto) {
      obtenerProyecto();
    }
  }, [infoProyecto]);

  // Mostrar loading mientras se obtiene el proyecto
  if (loadingProyecto) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando información del proyecto...</p>
      </div>
    );
  }

  // Mostrar error si hubo algún problema
  if (errorProyecto) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <p>Error: {errorProyecto}</p>
      </div>
    );
  }

  // Determinar qué layout usar según la fase del proyecto
  const esFaseTema = proyectoCompleto?.fase_actual === 'tema';

  return (
    <>
      <DocumentoPageClient 
        documentoId={documentoId} 
        onDataLoaded={handleDataLoaded}
      />
      {esFaseTema ? (
        <DocumentoLayoutClientTema
          datosDocumento={datosDocumento}
          datosEstudiante={datosEstudiante}
          datosProyecto={datosProyecto}
          blob={blob}
          infoProyecto={infoProyecto}
          contentType={contentType}
          datosCache={datosCache}
        />
      ) : (
        <DocumentoLayoutClient
          datosDocumento={datosDocumento}
          datosEstudiante={datosEstudiante}
          datosProyecto={datosProyecto}
          observaciones={observaciones}
          observacionesProyecto={observacionesProyecto}
          correcciones={correcciones}
          blob={blob}
          infoProyecto={infoProyecto}
          contentType={contentType}
        />
      )}
    </>
  );
}