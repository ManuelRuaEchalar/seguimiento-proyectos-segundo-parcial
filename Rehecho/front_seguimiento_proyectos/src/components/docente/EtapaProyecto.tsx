'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/userAuthGuard';
import { fetchEstudianteById } from '@/services/docentes';
import { obtenerDocumentos, Document } from '@/services/documentos';
import { usePendientes } from '@/contexts/PendientesContext';
import DocenteNavbar from '@/components/docente/DocenteNavbar';
import DocumentList from '@/components/estudiante/DocumentList';
import { FileText, Archive, BookOpen } from 'lucide-react';
import styles from './styles/EtapaProyecto.module.css';
import type { Pendiente as PendienteType } from '@/types/types';

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
  const { addPendiente } = usePendientes();
  
  console.log('Fase recibida en EtapaProyecto:', fase);

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

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: '' }));

      const studentData = await fetchEstudianteById(id);
      console.log('Datos del estudiante obtenidos:', studentData);

      let projectDocuments: Document[] = [];

      if (studentData.proyecto_id) {
        try {
          projectDocuments = await obtenerDocumentos(studentData.proyecto_id, fase);
          console.log('Documentos del proyecto obtenidos:', projectDocuments);
        } catch (docErr) {
          console.error('Error al obtener documentos:', docErr);
        }
      }

      setState({
        estudianteData: studentData,
        documents: projectDocuments,
        isLoading: false,
        error: ''
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al obtener datos del estudiante',
        isLoading: false
      }));
    }
  }, [id, fase]);

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user?.id, fetchData]);

  // Handle document click - MODIFICADO para guardar en context
  const handleDocumentClick = useCallback((documento: Document) => {

      const estadoValido = ['pendiente', 'aprobado', 'rechazado'].includes(documento.estado)
  ? (documento.estado as 'pendiente' | 'aprobado' | 'rechazado')
  : 'pendiente';
    // Guardar datos en el context antes de navegar
    if (state.estudianteData) {
      const pendienteData: PendienteType = {
        id: documento.id,
        titulo: documento.titulo,
        estado: estadoValido,
        version: documento.version,
        fase: documento.fase,
        estudiante: `${state.estudianteData.usuario.nombre} ${state.estudianteData.usuario.apellido}`,
        carrera: state.estudianteData.carrera,
        cu: state.estudianteData.cu,
        tema: state.estudianteData.proyecto?.titulo || 'Sin título'
      };

      console.log('💾 Guardando datos del documento en context:', pendienteData);
      addPendiente(pendienteData);
    }

    // Navegar al documento
    router.push(`/dashboard/docente/documento/${documento.id}`);
  }, [router, state.estudianteData, fase, addPendiente]);

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
        <DocenteNavbar
          nombreDocente={headerUser?.nombre || ''}
          apellidoDocente={headerUser?.apellido || ''}
          emailDocente={headerUser?.email || ''}
          estudianteName={state.estudianteData?.usuario.nombre || ''}
          estudianteApellido={state.estudianteData?.usuario.apellido || ''}
          estudianteEmail={state.estudianteData?.usuario.email || ''}
          estudianteCU={state.estudianteData?.cu || ''}
          carrera={state.estudianteData?.carrera || ''}
        />
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
        <DocenteNavbar
          nombreDocente=""
          apellidoDocente=""
          emailDocente=""
          estudianteName=""
          estudianteApellido=""
          estudianteEmail=""
          estudianteCU=""
          carrera=""
        />
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
        <DocenteNavbar
          nombreDocente={headerUser.nombre}
          apellidoDocente={headerUser.apellido}
          emailDocente={headerUser.email}
          estudianteName=""
          estudianteApellido=""
          estudianteEmail=""
          estudianteCU=""
          carrera=""
        />
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
        <DocenteNavbar
          nombreDocente={headerUser.nombre}
          apellidoDocente={headerUser.apellido}
          emailDocente={headerUser.email}
          estudianteName=""
          estudianteApellido=""
          estudianteEmail=""
          estudianteCU=""
          carrera=""
        />
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
                Documentos del Estudiante - Fase {fase}
              </h1>
              <p className={styles.contentSubtitle}>
                {state.estudianteData.proyecto?.titulo || 'Sin título de proyecto'}
              </p>
            </div>
          </div>

          <div className={styles.twoColumnLayout}>
            <section className={styles.documentListSection}>
              {state.estudianteData.proyecto && (
                <div className={styles.estudianteCard}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardItem}>
                      <div className={styles.cardLabel}>
                        <FileText size={16} />
                        <span>Fase:</span>
                      </div>
                      <p className={styles.cardValue}>{fase}</p>
                    </div>
                    <div className={styles.cardItem}>
                      <div className={styles.cardLabel}>
                        <BookOpen size={16} />
                        <span>Grado Actual:</span>
                      </div>
                      <p className={styles.cardValue}>{state.estudianteData.proyecto.grado_actual}</p>
                    </div>
                  </div>
                </div>
              )}

              <h2 className={styles.sectionTitle}>
                <FileText size={20} style={{ marginRight: '0.5rem' }} />
                Documentos del Proyecto
              </h2>
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

              {activeTab === 'ver' && (
                <>
                  {state.documents.length === 0 ? (
                    <div className={styles.emptyState}>
                      <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p>No hay documentos disponibles para esta fase.</p>
                    </div>
                  ) : (
                    <DocumentList documentos={state.documents} onDocumentClick={handleDocumentClick} />
                  )}
                </>
              )}

              {activeTab === 'historial' && (
                <>
                  {state.documents.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Archive size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p>No hay actividades registradas para este proyecto.</p>
                    </div>
                  ) : (
                    <DocumentList documentos={state.documents} onDocumentClick={handleDocumentClick} />
                  )}
                </>
              )}
            </section>

            <aside className={styles.uploadPanel}>
              <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>Información Adicional</h2>
                  <p className={styles.formSubtitle}>Espacio reservado para futuras funcionalidades</p>
                </div>
                <div className={styles.uploadForm}>
                  <p className={styles.placeholderText}>
                    No hay acciones disponibles en este momento.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EtapaProyecto;