import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import NavigationBar from '@/components/proyecto/NavigationBar';
import DocumentList from '@/components/proyecto/DocumentList';
import ErrorDisplay from '@/components/proyecto/ErrorDisplay';
import ProyectoClientPanel from '@/components/proyecto/ProyectoClientPanel';
import { ProyectoData } from '@/types';

async function getProyectoData(userId: string): Promise<ProyectoData> {
  const cookieStore = cookies();
  const cookieHeader = (await cookieStore).getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
  
  const apiUrl = process.env.API_URL;
  
  if (!apiUrl) {
    throw new Error('API_URL no está configurada');
  }

  try {
    const response = await fetch(`${apiUrl}/estudiante/view-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Reenvía cookies para autenticación
      },
      body: JSON.stringify({ id: Number(userId) }),
      cache: 'no-store', // Siempre fetch fresh data
    });

    if (response.status === 404) {
      notFound();
    }

    if (response.status === 401) {
      throw new Error('No autorizado');
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo obtener el proyecto`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching proyecto:', error);
    throw error;
  }
}

export default async function ProyectoPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  try {
    const proyectoData = await getProyectoData(id);

    return (
      <div className="proyecto-page">
        <NavigationBar
          codigoProyecto={proyectoData.codigoProyecto}
          titulo={proyectoData.titulo}
          documentosCount={proyectoData.documentos.length}
        />

        <main className="proyecto-main">
          <div className="proyecto-content">
            <div className="content-header">
              <h3 className="content-title">
                Documentos del Proyecto
              </h3>
              <ProyectoClientPanel />
            </div>
            
            <DocumentList documentos={proyectoData.documentos} />
          </div>
        </main>
      </div>
    );
  } catch (error: any) {
    return <ErrorDisplay error={error} />;
  }
}


// Metadata para SEO (opcional)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await the params promise
  try {
    const proyectoData = await getProyectoData(id);
    return {
      title: `Proyecto ${proyectoData.codigoProyecto} - ${proyectoData.titulo}`,
      description: `Documentos del proyecto ${proyectoData.titulo} con ${proyectoData.documentos.length} archivo(s)`
    };
  } catch {
    return {
      title: 'Proyecto - Error',
      description: 'No se pudo cargar el proyecto'
    };
  }
}