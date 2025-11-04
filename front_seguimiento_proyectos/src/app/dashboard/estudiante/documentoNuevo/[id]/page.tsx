import { Metadata } from 'next';
import { fetchDoc, fetchDocInfo, fetchProjectObservaciones } from '@/services/proyecto';
import { fetchObservaciones } from '@/services/observaciones';
import { fetchCorrecciones } from '@/services/correcciones';
import DocumentoLayoutClientCorrecciones from '@/components/documento/DocumentoLayoutClientCorrecciones';

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
    const observaciones = await fetchObservaciones(Number(id));
    console.log("OBSERVACIONES DE LA API: ", observaciones);
    const datosDocumento = await fetchDocInfo(Number(id));
    console.log("datosDocumento:", datosDocumento); // Log to verify property names
    const observacionesProyecto = await fetchProjectObservaciones(datosDocumento.proyecto_id, Number(id));
    console.log("observacionesProyecto:", observacionesProyecto); // Log to verify response
    const correcciones = await fetchCorrecciones(Number(id));
    const infoProyecto: infoProyecto = {
      codigoProyecto: datosDocumento.proyecto_id, // Changed from proyectoId
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
      <DocumentoLayoutClientCorrecciones
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
    console.error("Error in DocumentoPage:", error);
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Error al cargar el documento</h2>
          <p className="error-message">
            No se pudo obtener el documento
          </p>
          <a href="/docente" className="error-button">
            Volver al panel principal
          </a>
        </div>
      </div>
    );
  }
}