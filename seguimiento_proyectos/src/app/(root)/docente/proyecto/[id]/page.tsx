import { Metadata } from 'next';
import { fetchProyecto } from '@/services/proyecto';
import ProyectoContent from '@/components/proyecto/ProyectoContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const proyecto = await fetchProyecto(Number(id));
    
    return {
      title: `Proyecto #${proyecto.codigoProyecto} - CloudIt`,
      description: `Proyecto: ${proyecto.titulo}`,
      openGraph: {
        title: `Proyecto #${proyecto.codigoProyecto} - CloudIt`,
        description: `Proyecto: ${proyecto.titulo}`,
      },
    };
  } catch (error) {
    return {
      title: 'Proyecto - CloudIt',
      description: 'Detalles del proyecto del estudiante',
    };
  }
}

export default async function ProyectoPage(props: PageProps) {
  try {
    const { id } = await props.params;
    console.log("id antes de enviar: ",id);
    const proyecto = await fetchProyecto(Number(id));
    return <ProyectoContent proyecto={proyecto} estudianteId={id} />;
  } catch (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Error al cargar el proyecto</h2>
          <p className="error-message">
            No se pudo obtener la información del proyecto
          </p>
          <a href="/docente" className="error-button">
            Volver al panel principal
          </a>
        </div>
      </div>
    );
  }
}