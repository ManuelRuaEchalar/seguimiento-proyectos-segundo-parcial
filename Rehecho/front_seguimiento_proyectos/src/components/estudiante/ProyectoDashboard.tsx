'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/userAuthGuard';
import { getStudentProfile, obtenerProyecto } from '@/services/api';
import Navbar from '@/components/estudiante/Navbar';
import FormularioProyecto from '@/components/estudiante/FormularioProyecto';
import Etapa from '@/components/estudiante/Etapa';
import styles from '@/components/estudiante/styles/ProyectoDashboard.module.css';

interface StudentProfile {
  id: number;
  cu: string;
  carrera: string;
  proyecto_id: number | null;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  grupo: {
    id: number;
    nombre: string;
    grado: string;
  } | null;
  proyecto?: {
    id: number;
    titulo: string;
    fase_actual: string;
    grado_actual: string;
  } | null;
}

interface ProyectoDashboardProps {
  initialProfile: StudentProfile | null;
  initialError?: string;
}

export default function ProyectoDashboard({ initialProfile, initialError }: ProyectoDashboardProps) {
  const router = useRouter();
  const { user, isLoading: authLoading, isUnauthorized } = useAuthGuard('estudiante');

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(!initialProfile && !initialError);
  const [error, setError] = useState(initialError || '');
  const [proyectoCreado, setProyectoCreado] = useState(false);

useEffect(() => {
  if (user && !initialProfile && !proyectoCreado) {
    async function fetchProfile() {
      try {
        setError('');
        const profileData = await getStudentProfile();
        
        // Si tiene proyecto asignado, obtener sus detalles
        if (profileData.proyecto_id) {
          try {
            const proyectoData = await obtenerProyecto();
            profileData.proyecto = proyectoData;
          } catch (proyectoErr) {
            console.error('Error al obtener proyecto:', proyectoErr);
            // El perfil se carga igual, solo sin detalles del proyecto
          }
        }
        
        setStudentProfile(profileData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener el perfil del estudiante');
        setIsLoading(false);
      }
    }
    fetchProfile();
  }
}, [user, proyectoCreado, initialProfile]);

  const handleProyectoCreado = (proyectoId: number) => {
    setProyectoCreado(true);
    setTimeout(() => {
      setIsLoading(true);
      setProyectoCreado(false);
    }, 1500);
  };

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className={styles.errorContainer}>
        <h1>Usuario no autorizado 🚫</h1>
        <p>No tienes permiso para acceder a este panel.</p>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    );
  }

  if (error && !studentProfile) {
    return (
      <div className={styles.errorContainer}>
        <h1>Error al cargar el perfil 😞</h1>
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
        <h1>No se pudo obtener el perfil del estudiante</h1>
        <p>Por favor, intenta más tarde.</p>
      </div>
    );
  }

  const hasProyecto = studentProfile.proyecto_id !== null && studentProfile.proyecto_id !== undefined;
  const grupoNombre = studentProfile.grupo?.nombre || 'Sin grupo asignado';

  return (
    <div className={styles.page}>
      <Navbar
        nombre={studentProfile.usuario.nombre}
        apellido={studentProfile.usuario.apellido}
        email={studentProfile.usuario.email}
        cu={studentProfile.cu}
        carrera={studentProfile.carrera}
        grupo={grupoNombre}
      />

      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          {!hasProyecto ? (
            <FormularioProyecto onProyectoCreado={handleProyectoCreado} />
          ) : (
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

              <Etapa faseActual={studentProfile.proyecto?.fase_actual || 'tema'} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}