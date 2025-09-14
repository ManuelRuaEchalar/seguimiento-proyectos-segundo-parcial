'use client';

import { ProyectoData, Documento } from '@/types';
import ProyectoClientPanel from './ProyectoClientPanel';
import NavigationBar from './NavigationBar';
import { useRouter } from 'next/navigation';
import DocumentList from './DocumentList';

interface ProyectoContentProps {
  proyecto: ProyectoData;
  estudianteId: string;
}

export default function ProyectoContent({ proyecto, estudianteId }: ProyectoContentProps) {
  const router = useRouter();
  const handleDocumentClick = (documento: Documento) => {
    console.log("código del documento: ", documento.codigoDoc);
    router.push(`/docente/documento/${documento.codigoDoc}`);
  };
  
  return (
    <div className="proyecto-page">
      {/* Header section con botones y navegación */}
      <header className="proyecto-header">
        <ProyectoClientPanel />
        <NavigationBar
          codigoProyecto={proyecto.codigoProyecto}
          titulo={proyecto.titulo}
          documentosCount={proyecto.documentos.length}
        />
      </header>
      
      {/* Content principal */}
      <main className="proyecto-main">
        <div className="proyecto-content">
          <DocumentList 
        documentos={proyecto.documentos}
        onDocumentClick={handleDocumentClick}
      />
        </div>
      </main>
    </div>
  );
}