import { Metadata } from 'next';
import { fetchDoc, fetchDocInfo, fetchProjectObservaciones } from '@/services/proyecto';
import DocumentoLayoutClientEstudiante from '@/components/documento/DocumentoLayoutClientEstudiante';
import { fetchObservaciones, fetchObservacionesArea } from '@/services/observaciones';

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
    const observacionesArea = await fetchObservacionesArea(Number(id));
    const datosDocumento = await fetchDocInfo(Number(id));
    const observacionesProyecto = await fetchProjectObservaciones(datosDocumento.proyectoId, Number(id));
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
        observacionesArea={observacionesArea}
        observacionesProyecto={observacionesProyecto}
        blob={blob}
        infoProyecto={infoProyecto}
        contentType={contentType}
      />
    );
  } catch (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Error al cargar el documento</h2>
          <p className="error-message">
            No se pudo obtener el documento
          </p>
          <a href="/estudiante" className="error-button">
            Volver al panel principal
          </a>
        </div>
      </div>
    );
  }
}