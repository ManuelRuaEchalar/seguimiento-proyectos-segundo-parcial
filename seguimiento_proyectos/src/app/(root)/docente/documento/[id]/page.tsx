// page.tsx refactorizada
import { Metadata } from 'next';
import { fetchDoc } from '@/services/proyecto';
import DocumentoLayoutClient from '@/components/documento/DocumentoLayoutClient';
import { fetchObservaciones } from '@/services/observaciones';

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
    const observaciones  = await fetchObservaciones(Number(id));
    console.log("OBSERVACIONES DE LA API: ", observaciones);
    
    // Datos de ejemplo (temporales hasta recibir la info real)
    const datosDocumento = {
      nombreDocumento: `Tesis Final - Documento ${id}`,
      version: "v2.1",
      estado: "En Revisión",
      fechaSubida: "2024-01-15",
      numObservaciones: 3
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
      <DocumentoLayoutClient
        datosDocumento={datosDocumento}
        datosEstudiante={datosEstudiante}
        datosProyecto={datosProyecto}
        observaciones={observaciones}
        blob={blob}
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
          <a href="/docente" className="error-button">
            Volver al panel principal
          </a>
        </div>
      </div>
    );
  }
}