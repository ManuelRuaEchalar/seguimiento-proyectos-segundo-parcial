// page.tsx
import { Metadata } from 'next';
import { fetchDoc, fetchDocInfo, fetchProjectObservaciones } from '@/services/proyecto';
import DocumentoLayoutClient from '@/components/documento/DocumentoLayoutClient';
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
    console.log("codigo antes de mandar: ", id);
    console.log("IMPRIMIENDO");
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
    console.log(typeof(id));
    const { blob, contentType } = await fetchDoc(Number(id));
    console.log("blob conseguido");
    const observaciones  = await fetchObservaciones(Number(id));
    console.log("OBSERVACIONES DE LA API: ", observaciones);
    const datosDocumento = await fetchDocInfo(Number(id));
    console.log("datos doc: ", datosDocumento);
    
    // CORRECCIÓN: Usar proyecto_id en lugar de proyectoId
    console.log("proyecto_id desde API: ", datosDocumento.proyecto_id);
    
    const observacionesProyecto = await fetchProjectObservaciones(datosDocumento.proyecto_id, Number(id));
    const correcciones = await fetchCorrecciones(Number(id));
    
    // CORRECCIÓN: Usar proyecto_id que es el campo correcto de la API
    const infoProyecto: infoProyecto = {
      codigoProyecto: datosDocumento.proyecto_id,  // ← CAMBIO AQUÍ
      codigoDoc: Number(id)
    };
    
    // Validación adicional para debug
    if (!infoProyecto.codigoProyecto) {
      console.error('ERROR CRÍTICO: proyecto_id no existe en datosDocumento:', datosDocumento);
      throw new Error('No se pudo obtener el proyecto_id del documento');
    }
    
    console.log("infoProyecto creado correctamente:", infoProyecto);
    
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