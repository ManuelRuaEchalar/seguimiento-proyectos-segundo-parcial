// page.tsx refactorizada
import { Metadata } from 'next';
import { fetchDoc } from '@/services/proyecto';
import DocumentoLayoutClient from '@/components/documento/DocumentoLayoutClient';

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

    const observacionesEjemplo = [
      {
        id: 1,
        titulo: "Revisión del marco teórico",
        autor: "Dr. Carlos Mendoza",
        fecha: "2024-01-16",
        hora: "14:30",
        comentario: "Es necesario ampliar la sección sobre metodologías ágiles y incluir más referencias actuales."
      },
      {
        id: 2,
        titulo: "Formato de referencias",
        autor: "Dra. Ana López",
        fecha: "2024-01-16",
        hora: "16:45",
        comentario: "Verificar el formato APA en las referencias bibliográficas de las páginas 45-50."
      },
      {
        id: 3,
        titulo: "Análisis de resultados",
        autor: "Dr. Carlos Mendoza",
        fecha: "2024-01-17",
        hora: "09:15",
        comentario: "Los gráficos del capítulo 4 necesitan mejor explicación y análisis más detallado."
      }
    ];
    
    return (
      <DocumentoLayoutClient
        datosDocumento={datosDocumento}
        datosEstudiante={datosEstudiante}
        datosProyecto={datosProyecto}
        observaciones={observacionesEjemplo}
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