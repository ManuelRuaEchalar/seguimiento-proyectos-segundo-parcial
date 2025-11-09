'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerDocumentosPorProyectoYGrupo } from '@/services/documentos';
import ListaEntregas from '@/components/general/ListaEntregas';
import styles from './styles/Proyecto.module.css';

interface Estudiante {
  id: number;
  cu: string;
  carrera: string;
  usuario: { nombre: string; apellido: string; email: string };
}

interface Proyecto {
  id: number;
  titulo: string;
  fase: string;
  estudiantes: Estudiante[];
}

interface DocumentoFromAPI {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  justificacion: string | null;
  created_at: string;
  file: string;
  tipo: string;
  estudiante?: { nombre: string; apellido: string };
  actividad?: { nombre: string };
  proyecto?: Proyecto;
}

interface DocumentoForLista {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  justificacion: string | null;
  tipo: string;
  created_at: string;
  file: string;
  proyecto: Proyecto;
}

interface ProyectoProps {
  proyectoId: number;
  grupoId: number;
}

export default function Proyecto({ proyectoId, grupoId }: ProyectoProps) {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<DocumentoFromAPI[]>([]);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const docs = await obtenerDocumentosPorProyectoYGrupo(proyectoId, grupoId);
        setDocumentos(docs);

        if (docs.length > 0 && docs[0].proyecto) {
          setProyecto(docs[0].proyecto);
          const primera = docs[0].actividad?.nombre || 'Sin actividad';
          setActividadSeleccionada(primera);
        }
      } catch (err) {
        setError('No se pudieron cargar los documentos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [proyectoId, grupoId]);

  const handleEntregaClick = (id: number) => {
    const doc = documentos.find(d => d.id === id);
    if (doc) {
      localStorage.setItem('documentoActual', JSON.stringify(doc));
      router.push('/dashboard/docente/revision');
    }
  };

  const documentosPorActividad = documentos.reduce((acc, doc) => {
    const nombre = doc.actividad?.nombre || 'Sin actividad';
    acc[nombre] = acc[nombre] || [];
    acc[nombre].push(doc);
    return acc;
  }, {} as Record<string, DocumentoFromAPI[]>);

  const actividades = Object.keys(documentosPorActividad);

  if (loading) return <div className={styles.loading}>Cargando proyecto...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!proyecto) return <div className={styles.error}>Proyecto no encontrado</div>;

  return (
    <div className={styles.container}>
      {/* HEADER AZUL OSCURO COMPACTO */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.tituloContainer}>
            <h1>{proyecto.titulo}</h1>
            <span className={styles.fase}>{proyecto.fase}</span>
          </div>
          <div className={styles.integrantes}>
            {proyecto.estudiantes.map((est, i) => (
              <span key={est.id} className={styles.integrante}>
                {est.usuario.nombre} {est.usuario.apellido}
                {i < proyecto.estudiantes.length - 1 && <span className={styles.separador}> • </span>}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* BOTONES DE ACTIVIDADES (CELESTE) */}
      <div className={styles.actividadesBar}>
        <h3> Actividades:</h3>
        {actividades.length === 0 ? (
          <p className={styles.sinActividades}>No hay entregas registradas</p>
        ) : (
          actividades.map((nombre) => {
            const count = documentosPorActividad[nombre].length;
            const activa = actividadSeleccionada === nombre;

            return (
              <button
                key={nombre}
                onClick={() => setActividadSeleccionada(nombre)}
                className={`${styles.btnActividad} ${activa ? styles.activa : ''}`}
              >
                <span className={styles.nombreActividad}>{nombre}</span>
                <span className={styles.contador}>{count}</span>
              </button>
            );
          })
        )}
      </div>

      {/* LISTA DE ENTREGAS DE LA ACTIVIDAD SELECCIONADA */}
      {actividadSeleccionada && documentosPorActividad[actividadSeleccionada] && (
        <section className={styles.entregasSection}>
          <ListaEntregas
            documentos={documentosPorActividad[actividadSeleccionada]
              .map(d => d.proyecto ? { ...d, proyecto: d.proyecto! } as DocumentoForLista : null)
              .filter(Boolean) as DocumentoForLista[]
            }
            fase={proyecto.fase}
            onRevisar={handleEntregaClick}
          />
        </section>
      )}
    </div>
  );
}