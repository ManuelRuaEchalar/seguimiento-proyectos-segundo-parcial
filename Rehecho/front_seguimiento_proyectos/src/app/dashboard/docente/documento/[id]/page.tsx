// src/app/dashboard/docente/documento/[id]/page.tsx
import { Metadata } from 'next';
import { fetchDoc, fetchDocInfo, fetchProjectObservaciones } from '@/services/proyecto';
import DocumentoWrapper from './DocumentoWrapper';
import { fetchObservaciones } from '@/services/observaciones';
import { fetchCorrecciones } from '@/services/correcciones';
import styles from './page.module.css';

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

interface PageProps {
  params: Promise<{ id: number }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    return {
      title: `Documento #${id} - CloudIt`,
      description: `Visualización del documento #${id}`,
      openGraph: {
        title: `Documento #${id} - CloudIt`,
        description: `Visualización del documento #${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Documento - CloudIt',
      description: 'Visualización de un documento',
    };
  }
}

export default async function DocumentoPage(props: PageProps) {
  try {
    const { id } = await props.params;
    console.log("El codigo del doc de params es: ", id);
    
    const { blob, contentType } = await fetchDoc(Number(id));
    const observaciones = await fetchObservaciones(Number(id));
    const datosDocumento = await fetchDocInfo(Number(id));
    
    const observacionesProyecto = await fetchProjectObservaciones(datosDocumento.proyecto_id, Number(id));
    const correcciones = await fetchCorrecciones(Number(id));
    
    const infoProyecto: infoProyecto = {
      codigoProyecto: datosDocumento.proyecto_id,
      codigoDoc: Number(id)
    };
    
    if (!infoProyecto.codigoProyecto) {
      console.error('ERROR CRÍTICO: proyecto_id no existe en datosDocumento:', datosDocumento);
      throw new Error('No se pudo obtener el proyecto_id del documento');
    }
    
    const datosEstudiante = {
      nombre: "María González Pérez",
      carrera: "Ingeniería de Sistemas",
      semestre: "10mo"
    };

    const datosProyecto = {
      titulo: "Sistema de Gestión Académica",
      descripcion: "Desarrollo de una plataforma web para la gestión integral de procesos académicos universitarios",
      fechaEntrega: "2024-02-28"
    };
    
    return (
      <DocumentoWrapper
        documentoId={Number(id)}
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
    );
  } catch (error) {
    console.error("Error completo en DocumentoPage:", error);
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2 className={styles.errorTitle}>Error al cargar el documento</h2>
          <p className={styles.errorMessage}>
            No se pudo obtener el documento: {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          <a href="/docente" className={styles.errorButton}>
            Volver al panel principal
          </a>
        </div>
      </div>
    );
  }
}