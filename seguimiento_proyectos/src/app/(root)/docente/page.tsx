// app/(root)/docente/page.tsx
'use client';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMisEstudiantes } from '@/services/estudiantes';
import { Estudiante } from '@/types';
import Header from '@/components/docente/Header';
import EstudiantesList from '@/components/docente/EstudiantesList';
import LoadingSpinner from '@/components/docente/LoadingSpinner';
import ErrorMessage from '@/components/docente/ErrorMessage';
import EmptyState from '@/components/docente/EmptyState';
import NoUserMessage from '@/components/docente/NoUserMessage';

const DocentePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEstudiantes = async () => {
      if (!user?.grupo_id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMisEstudiantes(user.grupo_id);
        setEstudiantes(data);
      } catch (err: any) {
        console.error('Error al cargar estudiantes:', err);
        setError(err.message);
        if (err.message.includes('401') || err.message.includes('No autorizado')) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadEstudiantes();
    }
  }, [user, logout]);

  const handleEstudianteClick = (estudiante: Estudiante) => {
    console.log('Navegando a proyecto de:', estudiante.nombre);
    router.push(`/docente/proyecto/${estudiante.user_id}`);
  };

  if (!user) {
    return <NoUserMessage />;
  }

  return (
    <div className="docente-page">
      <Header userName={user.nombre} userEmail={user.email} />
      
      <main className="docente-main">
        <div className="docente-content">
          <h2 className="content-title">
            Mis Estudiantes
          </h2>
          
          {loading && <LoadingSpinner />}
          
          {error && <ErrorMessage message={error} />}
          
          {!loading && !error && estudiantes.length === 0 && <EmptyState />}
          
          {!loading && !error && estudiantes.length > 0 && (
            <EstudiantesList
              estudiantes={estudiantes}
              onEstudianteClick={handleEstudianteClick}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DocentePage;