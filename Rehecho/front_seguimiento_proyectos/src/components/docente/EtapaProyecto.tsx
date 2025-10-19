
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/userAuthGuard';
import { fetchEstudianteById } from '@/services/docentes';
import { obtenerDocumentos, Document } from '@/services/documentos';
import DocenteNavbar from '@/components/docente/DocenteNavbar';
import DocumentList from '@/components/estudiante/DocumentList';
import { FileText, Archive, BookOpen } from 'lucide-react';
import styles from './styles/EtapaProyecto.module.css';

interface EstudianteData {
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
  proyecto: {
    id: number;
    titulo: string;
    fase_actual: string;
    grado_actual: string;
  } | null;
}

interface EtapaProyectoProps {
  id: number;
  fase: string;
}

const EtapaProyecto = ({ id, fase }: EtapaProyectoProps) => {
  const router = useRouter();
  const { user, isLoading: authLoading, isUnauthorized } = useAuthGuard('docente');
  console.log('Fase recibida en EtapaProyecto:', fase);
  
  // Combinar estados relacionados en un solo objeto
  const [state, setState] = useState<{
    estudianteData: EstudianteData | null;
    documents: Document[];
    isLoading: boolean;
    error: string;
  }>({
    estudianteData: null,
    documents: [],
    isLoading: true,
    error: ''
  });
  
  const [activeTab, setActiveTab] = useState<'ver' | 'historial'>('ver');

  // Memoizar la función de fetch con useCallback
  const fetchData = useCallback(async () => {
    try {
      // Un solo setState al inicio
      setState(prev => ({ ...prev, isLoading: true, error: '' }));

      // Fetch student data by ID
      const studentData = await fetchEstudianteById(id);
      console.log('Datos del estudiante obtenidos:', studentData);
      
      let projectDocuments: Document[] = [];

      // Fetch documents if student has a project
      if (studentData.proyecto_id) {
        try {
          projectDocuments = await obtenerDocumentos(studentData.proyecto_id, fase);
        } catch (docErr) {
          console.error('Error al obtener documentos:', docErr);
        }
      }

      // Un solo setState al final con todos los datos
      setState({
        estudianteData: studentData,
        documents: projectDocuments,
        isLoading: false,
        error: ''
      });
    } catch (err) {
      // Un solo setState para el error
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al obtener datos del estudiante',
        isLoading: false
      }));
    }
  }, [id]);

  // Load student and project data
  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user?.id, fetchData]);

  // Handle document click for navigation
  const handleDocumentClick = useCallback((documento: Document) => {
    router.push(`/dashboard/docente/documento/${documento.id}`);
  }, [router]);

  // Format user data for Header component
  const headerUser = user?.nombre && user?.apellido && user?.email && user?.rol
    ? {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    : null;

  if (authLoading || state.isLoading) {
    return (
      <div className={styles.proyectoPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Cargando información del estudiante...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized || !user || !headerUser) {
    return (
      <div className={styles.proyectoPage}>
        <div className={styles.noUserContainer}>
          <div className={styles.noUserContent}>
            <h2 className={styles.noUserTitle}>Acceso Denegado</h2>
            <p className={styles.noUserMessage}>
              No tienes permisos para acceder a esta página.
              <br />
              <a href="/auth/signin" className={styles.errorButton}>Iniciar Sesión</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.proyectoPage}>
        <div className={styles.noUserContainer}>
          <div className={styles.noUserContent}>
            <h2 className={styles.noUserTitle}>Error</h2>
            <p className={styles.noUserMessage}>
              {state.error}
              <br />
              <button 
                onClick={() => router.back()} 
                className={styles.errorButton}
              >
                Volver
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!state.estudianteData) {
    return (
      <div className={styles.proyectoPage}>
        <div className={styles.noUserContainer}>
          <div className={styles.noUserContent}>
            <h2 className={styles.noUserTitle}>Estudiante no encontrado</h2>
            <p className={styles.noUserMessage}>
              No se pudo encontrar la información del estudiante.
              <br />
              <button 
                onClick={() => router.back()} 
                className={styles.errorButton}
              >
                Volver
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.proyectoPage}>
      <DocenteNavbar
        nombreDocente={headerUser.nombre}
        apellidoDocente={headerUser.apellido}
        emailDocente={headerUser.email}
        estudianteName={state.estudianteData.usuario.nombre}
        estudianteApellido={state.estudianteData.usuario.apellido}
        estudianteEmail={state.estudianteData.usuario.email}
        estudianteCU={state.estudianteData.cu}
        carrera={state.estudianteData.carrera}
      />
      <main className={styles.proyectoMain}>
        <div className={styles.proyectoContent}>
          <div className={styles.contentHeader}>
            <div>
              <h1 className={styles.contentTitle}>
                Proyecto #{state.estudianteData.proyecto_id || 'N/A'}
              </h1>
              <p className={styles.contentSubtitle}>
                {state.estudianteData.proyecto?.titulo || 'Sin título de proyecto'}
              </p>
            </div>
          </div>

          {/* Project Info Card */}
          {state.estudianteData.proyecto && (
            <div className={styles.estudianteCard} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <FileText size={16} style={{ color: '#5b88a5' }} />
                    <span style={{ fontWeight: '500', color: '#243a69', fontSize: '0.875rem' }}>Fase:</span>
                  </div>
                  <p style={{ color: '#243a69', fontSize: '0.875rem', marginLeft: '1.5rem' }}>
                    {fase}
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <BookOpen size={16} style={{ color: '#5b88a5' }} />
                    <span style={{ fontWeight: '500', color: '#243a69', fontSize: '0.875rem' }}>Grado Actual:</span>
                  </div>
                  <p style={{ color: '#243a69', fontSize: '0.875rem', marginLeft: '1.5rem' }}>
                    {state.estudianteData.proyecto.grado_actual}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className={styles.navButtons}>
            <button
              onClick={() => setActiveTab('ver')}
              className={`${styles.navButton} ${activeTab === 'ver' ? styles.navButtonActive : ''}`}
            >
              <FileText size={18} />
              <span>Ver documentos</span>
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`${styles.navButton} ${activeTab === 'historial' ? styles.navButtonActive : ''}`}
            >
              <Archive size={18} />
              <span>Historial</span>
            </button>
          </nav>

          <section className={styles.documentCard}>
            {activeTab === 'ver' && (
              <div>
                <h2 className={styles.contentTitle} style={{ marginBottom: '1.5rem' }}>
                  Documentos del Proyecto
                </h2>
                {state.documents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#5b88a5' }}>
                    <FileText size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                    <p>No hay documentos disponibles para este proyecto.</p>
                  </div>
                ) : (
                  <DocumentList documentos={state.documents} onDocumentClick={handleDocumentClick} />
                )}
              </div>
            )}

            {activeTab === 'historial' && (
              <div>
                <h2 className={styles.contentTitle} style={{ marginBottom: '1.5rem' }}>
                  Historial de Actividades
                </h2>
                {state.documents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#5b88a5' }}>
                    <Archive size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                    <p>No hay actividades registradas para este proyecto.</p>
                  </div>
                ) : (
                  <DocumentList documentos={state.documents} onDocumentClick={handleDocumentClick} />
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default EtapaProyecto;