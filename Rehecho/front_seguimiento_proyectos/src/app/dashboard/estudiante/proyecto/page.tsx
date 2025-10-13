import ProyectoDashboard from '@/components/estudiante/ProyectoDashboard';
import { getStudentProfile } from '@/services/api';
import { StudentProfile } from '@/types/index';

export default async function Page() {
  let initialProfile: StudentProfile | null = null;
  let error: string | null = null;

  try {
    initialProfile = await getStudentProfile();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al obtener el perfil';
  }

  return <ProyectoDashboard initialProfile={initialProfile} initialError={error ?? undefined} />;
}