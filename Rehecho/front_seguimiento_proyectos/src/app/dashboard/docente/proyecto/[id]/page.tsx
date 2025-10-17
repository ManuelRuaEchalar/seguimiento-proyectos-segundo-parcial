// app/dashboard/docente/proyecto/[id]/page.tsx
import DocenteProyectoDashboardClient from '@/components/docente/DocenteProyectoDashboard';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const estudianteId = parseInt(id, 10);
  
  if (isNaN(estudianteId)) {
    return <div>ID de estudiante inválido</div>;
  }

  // El Server Component solo pasa el ID, el Client Component hace el fetch
  return <DocenteProyectoDashboardClient estudianteId={estudianteId} />;
}