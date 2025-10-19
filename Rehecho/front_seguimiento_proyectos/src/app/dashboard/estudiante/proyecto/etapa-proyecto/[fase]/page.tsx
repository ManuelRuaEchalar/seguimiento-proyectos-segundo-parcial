// app/dashboard/estudiante/[fase]/page.tsx
import EstudianteConGrupoClient from '@/components/estudiante/EstudianteConGrupo';

interface PageProps {
  params: Promise<{
    fase: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { fase } = await params;
  console.log('Fase recibida en Page:', fase);

  // Validar que la fase sea válida
  const fasesValidas = ['tema', 'perfil', 'proyecto'];
  if (!fasesValidas.includes(fase)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Fase inválida</h2>
        <p>Las fases válidas son: tema, perfil, proyecto</p>
      </div>
    );
  }

  return <EstudianteConGrupoClient fase={fase} />;
}