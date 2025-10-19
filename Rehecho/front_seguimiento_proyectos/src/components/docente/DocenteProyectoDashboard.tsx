'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/userAuthGuard';
import { obtenerProyecto } from '@/services/api';
import { fetchEstudianteById } from '@/services/docentes';
import DocenteNavbar from '@/components/docente/DocenteNavbar';
import Etapa from '@/components/estudiante/Etapa';
import { StudentProfile } from '@/types/index';
import styles from '@/components/estudiante/styles/ProyectoDashboard.module.css';
import { fetchProyecto } from '@/services/proyecto';

interface Props {
  estudianteId: number;
}

export default function DocenteProyectoDashboardClient({ estudianteId }: Props) {
  const router = useRouter();
  const { user, isLoading: authLoading, isUnauthorized } = useAuthGuard('docente');

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Cargar datos del estudiante ===
  useEffect(() => {
    if (!user?.id) return; // Verificar user?.id en lugar de user

    const loadProfile = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Obtener el perfil del estudiante
        const profileData = await fetchEstudianteById(estudianteId);

        // Si el estudiante tiene un proyecto, traer detalles adicionales
        if (profileData.proyecto_id) {
          try {
            console.log('Cargando detalles del proyecto para ID:', profileData.proyecto_id);
            const proyectoData = await fetchProyecto(profileData.id);
            profileData.proyecto = proyectoData;
            console.log('Detalles del proyecto cargados:', proyectoData);
          } catch (proyectoErr) {
            console.warn('Error al obtener detalles del proyecto:', proyectoErr);
          }
        }

        setStudentProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil del estudiante');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [estudianteId, user?.id]); // ← Cambiar 'user' por 'user?.id'

  // === Estados de carga / error / autorización ===
  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando perfil del estudiante...</p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className={styles.errorContainer}>
        <h1>Usuario no autorizado 🚫</h1>
        <p>No tienes permiso para acceder a este panel.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1>Error al cargar los datos 😞</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className={styles.errorContainer}>
        <h1>No se encontró el perfil del estudiante</h1>
        <p>Intenta nuevamente más tarde.</p>
      </div>
    );
  }

  // === Render principal ===
  const hasProyecto = !!studentProfile.proyecto_id;
  const grupoNombre = studentProfile.grupo?.nombre || 'Sin grupo asignado';

  return (
    <div className={styles.page}>
      <DocenteNavbar
        nombreDocente={user?.nombre || 'Docente'}
        apellidoDocente={user?.apellido || ''}
        emailDocente={user?.email || ''}
        estudianteName={studentProfile.usuario.nombre}
        estudianteApellido={studentProfile.usuario.apellido}
        estudianteEmail={studentProfile.usuario.email}
        estudianteCU={studentProfile.cu}
        carrera={studentProfile.carrera}
      />

      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          {hasProyecto ? (
            <>
              <div className={styles.proyectoHeader}>
                <div className={styles.proyectoInfo}>
                  <h2 className={styles.proyectoTitulo}>{studentProfile.proyecto?.titulo}</h2>
                  <p className={styles.proyectoSubtitulo}>
                    Proyecto de {studentProfile.grupo?.grado === 'grado1' ? 'Primer' : 'Segundo'} Grado
                  </p>
                </div>
                <div className={styles.proyectoMeta}>
                  <span className={styles.metaItem}>
                    <strong>Etapa Actual:</strong>
                    <span className={styles.stageBadge}>
                      {studentProfile.proyecto?.fase_actual.toUpperCase()}
                    </span>
                  </span>
                </div>
              </div>

              <Etapa faseActual={studentProfile.proyecto?.fase_actual || 'tema'} rol={"docente"} proyectoId={studentProfile.id}/>
            </>
          ) : (
            <div className={styles.errorContainer}>
              <h2>El estudiante aún no ha creado su proyecto</h2>
              <p>Por favor, espera a que el estudiante cree su proyecto.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}