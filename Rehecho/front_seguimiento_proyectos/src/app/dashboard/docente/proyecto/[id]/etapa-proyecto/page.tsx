// app/dashboard/docente/proyecto/[id]/etapa-proyecto/page.tsx
import EtapaProyectoClient from '@/components/docente/EtapaProyecto';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // ← AWAIT aquí
  console.log('ID recibido en Page:', id);

  return <EtapaProyectoClient id={Number(id)} />;
}