'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavbarRevision from '@/components/general/NavbarRevision';
import { fetchDoc } from '@/services/proyecto';
import { fetchTeacherObservations } from '@/services/docentes';
import styles from './page.module.css';
import { VisualizadorPDFCorrecciones } from '@/components/documento/VisualizadorPDFCorrecciones';

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

  // 🔹 1️⃣ Cargar los datos básicos desde localStorage
  useEffect(() => {
    const documentoStr = localStorage.getItem('documentoActual');
    const actividadStr = localStorage.getItem('actividadActual');
    const estudianteStr = localStorage.getItem('estudianteInfo');

    if (!documentoStr || !actividadStr || !estudianteStr) {
      console.warn('⚠️ Faltan datos en localStorage');
      router.push('/dashboard/docente/actividad');
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

    setDocumento(documentoData);
    setActividad(actividadData);
    setEstudianteInfo(estudianteData);
  }, [router]);

  // 🔹 2️⃣ Cuando estudianteInfo y documento estén listos, hacer fetch
  useEffect(() => {
    if (!documento || !actividad || !estudianteInfo) return;

    const fetchData = async () => {
      try {
        console.log('🔹 Cargando datos de observaciones...');
        console.log('👤 ID estudiante:', estudianteInfo.id);
        console.log('📄 ID documento:', documento.id);

        const [docData, obsData] = await Promise.all([
          fetchDoc(documento.id),
          fetchTeacherObservations(estudianteInfo.id, actividad.id),
        ]);

        setDocumentoBlob(docData);
        setObservacionesYCorrecciones(obsData);

        console.log('📑 Documento Blob cargado:', docData);
        console.log('🗒️ Observaciones y correcciones:', obsData);
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

  const correccionesLocales =
    observacionesYCorrecciones?.documentos
      ?.find((doc: any) => doc.id === documento.id)
      ?.correcciones || [];

  const observacionesExternas =
    observacionesYCorrecciones?.documentos
      ?.filter((doc: any) => doc.id !== documento.id)
      ?.flatMap((doc: any) => doc.observaciones) || [];

  const correccionesExternas =
    observacionesYCorrecciones?.documentos
      ?.filter((doc: any) => doc.id !== documento.id)
      ?.flatMap((doc: any) => doc.correcciones) || [];

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
        role="estudiante_correccion"
        version={documento.version}
        titulo={documento.titulo}
        nombreEstudiante={nombreCompleto}
        codigoUniversitario={estudiante.cu}
        carrera={estudiante.carrera}
      />

      <div className={styles.documentoBody}>
        <div className={styles.pdfContainer}>
          {documentoBlob && (
            <VisualizadorPDFCorrecciones
              blob={documentoBlob.blob}
              observaciones={observacionesExternas}
              correcciones={correccionesLocales}
              infoProyecto={infoProyecto}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}
