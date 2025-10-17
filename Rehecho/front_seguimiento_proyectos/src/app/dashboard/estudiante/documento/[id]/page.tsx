import { Metadata } from 'next';
import { fetchDoc, fetchDocInfo, fetchProjectObservaciones } from '@/services/proyecto';
import DocumentoLayoutClientEstudiante from '@/components/documento/DocumentoLayoutClientEstudiante';
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
      description: `Visualización del documento #${id} para estudiante`,
      openGraph: {
        title: `Documento #${id} - CloudIt`,
        description: `Visualización del documento #${id} para estudiante`,
      },
    };
  } catch (error) {
    return {
      title: 'Documento - CloudIt',
      description: 'Visualización de un documento para estudiante',
    };
  }
}

export default async function DocumentoPageEstudiante(props: PageProps) {
  try {
    const { id } = await props.params;
    const { blob, contentType } = await fetchDoc(Number(id));
    const observaciones = await fetchObservaciones(Number(id));
    const datosDocumento = await fetchDocInfo(Number(id));
    const observacionesProyecto = await fetchProjectObservaciones(datosDocumento.proyecto_id, Number(id));
    const correcciones = await fetchCorrecciones(Number(id))
    const infoProyecto: infoProyecto = {
      codigoProyecto: datosDocumento.proyectoId,
      codigoDoc: Number(id)
    }; 
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
      <DocumentoLayoutClientEstudiante
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
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className={styles.errorTitle}>Error al cargar el documento</h2>
          <p className={styles.errorMessage}>
            No se pudo obtener el documento. Por favor, verifica que el documento existe y que tienes los permisos necesarios.
          </p>
          <a href="/estudiante" className={styles.errorButton}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver al panel principal
          </a>
        </div>
      </div>
    );
  }
}