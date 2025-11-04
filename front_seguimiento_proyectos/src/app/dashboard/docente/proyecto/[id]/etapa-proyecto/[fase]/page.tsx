// app/dashboard/docente/proyecto/[id]/etapa-proyecto/[fase]/page.tsx
import EtapaProyectoClient from '@/components/docente/EtapaProyecto';

interface PageProps {
  params: Promise<{
    id: string;
    fase: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id, fase } = await params;
  console.log('ID recibido en Page:', id);
  console.log('Fase recibida en Page:', fase);

  // Validar que la fase sea válida
  const fasesValidas = ['tema', 'perfil', 'proyecto'];
  if (!fasesValidas.includes(fase)) {
    return <div>Fase inválida. Las fases válidas son: tema, perfil, proyecto</div>;
  }

  return <EtapaProyectoClient id={Number(id)} fase={fase} />;
}