'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer } from 'react';
import { fetchMisEstudiantes } from '@/services/estudiantes';
import Header from '@/components/docente/Header';
import { Estudiante } from '@/types';
import EstudiantesList from '@/components/docente/EstudiantesList';
import LoadingSpinner from '@/components/docente/LoadingSpinner';
import ErrorMessage from '@/components/docente/ErrorMessage';
import EmptyState from '@/components/docente/EmptyState';
import NoUserMessage from '@/components/docente/NoUserMessage';

// Tipos para el reducer
interface EstadoEstudiantes {
  estudiantes: any[];
  loading: boolean;
  error: string | null;
}

type AccionEstudiantes =
  | { type: 'INICIAR_CARGA' }
  | { type: 'CARGA_EXITOSA'; payload: any[] }
  | { type: 'CARGA_FALLIDA'; payload: string }
  | { type: 'RESETEAR_ERROR' };

// Reducer para gestionar el estado
function estudiantesReducer(state: EstadoEstudiantes, action: AccionEstudiantes): EstadoEstudiantes {
  switch (action.type) {
    case 'INICIAR_CARGA':
      return { ...state, loading: true, error: null };
    case 'CARGA_EXITOSA':
      return { ...state, loading: false, estudiantes: action.payload, error: null };
    case 'CARGA_FALLIDA':
      return { ...state, loading: false, error: action.payload };
    case 'RESETEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const estadoInicial: EstadoEstudiantes = {
  estudiantes: [],
  loading: true,
  error: null,
};

// Hook personalizado para la carga de estudiantes
function useEstudiantes(grupoId: string | undefined, logout: () => void) {
  const [state, dispatch] = useReducer(estudiantesReducer, estadoInicial);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      if (!grupoId) {
        dispatch({ type: 'CARGA_FALLIDA', payload: 'No se encontró el grupo del docente' });
        return;
      }

      dispatch({ type: 'INICIAR_CARGA' });
      
      try {
        const data = await fetchMisEstudiantes(grupoId);
        dispatch({ type: 'CARGA_EXITOSA', payload: data });
      } catch (err: any) {
        console.error('Error al cargar estudiantes:', err);
        dispatch({ type: 'CARGA_FALLIDA', payload: err.message });
        if (err.message.includes('401') || err.message.includes('No autorizado')) {
          logout();
        }
      }
    };

    cargarEstudiantes();
  }, [grupoId, logout]);

  return state;
}

const DocentePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { estudiantes, loading, error } = useEstudiantes(user?.grupo_id, logout);

  const handleEstudianteClick = (estudiante: Estudiante) => {
    console.log("id del estudiante: ", estudiante.user_id);
    router.push(`/docente/proyecto/${Number(estudiante.user_id)}`);
  };

  if (!user) {
    return <NoUserMessage />;
  }

  return (
    <div className="docente-page">
      <Header userName={user.nombre} userEmail={user.email} />

      <main className="docente-main">
        <div className="docente-content">
          <h2 className="content-title">Mis Estudiantes</h2>

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