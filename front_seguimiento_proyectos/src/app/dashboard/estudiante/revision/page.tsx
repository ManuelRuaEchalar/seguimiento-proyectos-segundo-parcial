'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NavbarRevision from '@/components/general/NavbarRevision';
import { fetchDoc } from '@/services/proyecto';
import { fetchFinal } from '@/services/finales';
import { fetchTeacherObservations } from '@/services/docentes';
import styles from './page.module.css';
import { VisualizadorPDF } from '@/components/documento/VisualizadorPDF';

interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
}

interface Estudiante {
  id: number;
  cu: string;
  carrera: string;
  usuario: Usuario;
}

interface Proyecto {
  id: number;
  titulo: string;
  estudiantes: Estudiante[];
}

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  justificacion: string | null;
  created_at: string;
  file: string;
  proyecto: Proyecto;
  tags?: any[]; // Propiedad opcional que indica si es un documento final
}

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

export default function RevisionEstudiantePage() {
  const router = useRouter();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [actividad, setActividad] = useState<any>(null);
  const [estudianteInfo, setEstudianteInfo] = useState<any>(null);
  const [observacionesYCorrecciones, setObservacionesYCorrecciones] = useState<any>(null);
  const [documentoBlob, setDocumentoBlob] = useState<{ blob: Blob; contentType: string } | null>(null);

  // Determinar si es un documento final (tiene tags)
  const esDocumentoFinal = useMemo(() => {
    return documento?.tags !== undefined;
  }, [documento]);

  // 🔹 1️⃣ Cargar los datos básicos desde localStorage
  useEffect(() => {
    const documentoStr = localStorage.getItem('documentoActual');
    const actividadStr = localStorage.getItem('actividadActual');
    const estudianteStr = localStorage.getItem('estudianteInfo');

    if (!documentoStr || !actividadStr || !estudianteStr) {
      console.warn('⚠️ Faltan datos en localStorage');
      router.push('/dashboard/estudiante/actividad');
      return;
    }

    const documentoData = JSON.parse(documentoStr);
    const actividadData = JSON.parse(actividadStr);
    const estudianteData = JSON.parse(estudianteStr);

    if (!documentoData?.id || !actividadData?.id || !estudianteData?.id) {
      console.error('❌ Datos inválidos en localStorage');
      return;
    }

    console.log('📘 Documento:', documentoData);
    console.log('📗 Actividad:', actividadData);
    console.log('📙 Estudiante (raw):', estudianteData);
    console.log('🎯 Es documento final:', documentoData.tags !== undefined);

    setDocumento(documentoData);
    setActividad(actividadData);
    setEstudianteInfo(estudianteData);
  }, [router]);

  // 🔹 2️⃣ Cuando estudianteInfo y documento estén listos, hacer fetch
  useEffect(() => {
    if (!documento || !actividad || !estudianteInfo) return;

    const fetchData = async () => {
      try {
        console.log('🔹 Cargando datos de documento...');
        console.log('👤 ID estudiante:', estudianteInfo.id);
        console.log('📄 ID documento:', documento.id);
        console.log('📋 Es final:', documento.tags !== undefined);

        // Determinar si es documento final
        const esDocFinal = documento.tags !== undefined;
        
        let docData;
        if (esDocFinal) {
          console.log('📄 Obteniendo documento FINAL con ID:', documento.id);
          docData = await fetchFinal(documento.id);
        } else {
          console.log('📄 Obteniendo documento NORMAL con ID:', documento.id);
          docData = await fetchDoc(documento.id);
        }

        setDocumentoBlob(docData);

        // Solo obtener observaciones si NO es documento final
        if (!esDocFinal) {
          const obsData = await fetchTeacherObservations(estudianteInfo.id, actividad.id);
          setObservacionesYCorrecciones(obsData);
          console.log('🗒️ Observaciones y correcciones:', obsData);
        } else {
          console.log('📋 Documento final - sin observaciones ni correcciones');
        }

        console.log('📑 Documento Blob cargado:', docData);
      } catch (error) {
        console.error('❌ Error al obtener el documento o las observaciones:', error);
      }
    };

    fetchData();
  }, [documento, actividad, estudianteInfo]);

  if (!documento || !estudianteInfo) {
    return <p>Cargando datos...</p>;
  }

  // 🔹 3️⃣ Preparar el estudiante en formato correcto
  const estudiante: Estudiante = {
    id: estudianteInfo.id,
    cu: estudianteInfo.cu,
    carrera: estudianteInfo.carrera,
    usuario: {
      nombre: estudianteInfo.usuario?.nombre ?? '',
      apellido: estudianteInfo.usuario?.apellido ?? '',
      email: estudianteInfo.usuario?.email ?? '',
    },
  };

  const nombreCompleto = `${estudiante.usuario.nombre} ${estudiante.usuario.apellido}`;

  // 🔹 4️⃣ Procesar observaciones/correcciones (solo si NO es final y ya llegaron)
  const observacionesLocales = !esDocumentoFinal && observacionesYCorrecciones?.documentos
    ?.find((doc: any) => doc.id === documento.id)
    ?.observaciones || [];

  const correccionesLocales = !esDocumentoFinal && observacionesYCorrecciones?.documentos
    ?.find((doc: any) => doc.id === documento.id)
    ?.correcciones
    ?.filter((c: any) => c.estado !== 'rechazado') || [];

  const observacionesExternas = !esDocumentoFinal && observacionesYCorrecciones?.documentos
    ?.filter((doc: any) => doc.id !== documento.id)
    ?.flatMap((doc: any) => doc.observaciones) || [];

  const correccionesExternas = !esDocumentoFinal && observacionesYCorrecciones?.documentos
    ?.filter((doc: any) => doc.id !== documento.id)
    ?.flatMap((doc: any) => doc.correcciones) || [];

  console.log('📘 Observaciones Locales:', observacionesLocales);
  console.log('📕 Observaciones Externas:', observacionesExternas);
  console.log('📝 Correcciones Locales:', correccionesLocales);
  console.log('📄 Correcciones Externas:', correccionesExternas);

  // 🔹 5️⃣ Construir infoProyecto
  const infoProyecto: infoProyecto = {
    codigoProyecto: estudianteInfo.proyecto_id,
    codigoDoc: documento.id,
  };

  return (
    <>
      <div className={styles.documentoPageLayout}>
        <NavbarRevision
          role="estudiante"
          version={documento.version}
          titulo={documento.titulo}
          nombreEstudiante={nombreCompleto}
          codigoUniversitario={estudiante.cu}
          carrera={estudiante.carrera}
          documento_id={documento.id}
          fase={actividad.fase}
          fase_proyecto={estudianteInfo.proyecto.fase_actual}
          proyecto_id={estudianteInfo.proyecto.id}
          es_final={actividad.es_final || esDocumentoFinal}
        />

        <div className={styles.documentoBody}>
          <div className={styles.pdfContainer}>
            {documentoBlob && (
              <VisualizadorPDF
                blob={documentoBlob.blob}
                observaciones={observacionesLocales}
                observacionesOtrasVersiones={observacionesExternas}
                correcciones={correccionesLocales}
                infoProyecto={infoProyecto}
                contentType={documentoBlob.contentType}
                role={'estudiante'}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}