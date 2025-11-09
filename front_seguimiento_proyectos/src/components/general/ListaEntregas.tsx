import { useState } from 'react';
import Entrega from './Entrega';
import styles from './styles/ListaEntregas.module.css';

interface Estudiante {
  id: number;
  cu: string;
  carrera: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  justificacion: string | null;
  created_at: string;
  file: string;
  tipo?: string;
  proyecto: {
    id: number;
    titulo: string;
    estudiantes: Estudiante[];
  };
}

interface ListaEntregasProps {
  documentos: Documento[];
  fase?: string;
  onRevisar: (entregaId: number) => void;
}

export default function ListaEntregas({ documentos, fase, onRevisar }: ListaEntregasProps) {
  const [vistaActual, setVistaActual] = useState<'ciclos' | 'pendientes'>('ciclos');

  if (!documentos || documentos.length === 0) {
    return (
      <div className={styles.entregasContainer}>
        <div className={styles.emptyState}>
          <p>No hay entregas para esta actividad aún.</p>
        </div>
      </div>
    );
  }

  // Vista por pendientes: ordenar documentos con pendientes primero
  const documentosOrdenados = [...documentos].sort((a, b) => {
    if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
    if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
    return 0;
  });

  // Vista por ciclos: agrupar documentos por versión
  const documentosPorVersion = documentos.reduce((acc, doc) => {
    if (!acc[doc.version]) {
      acc[doc.version] = [];
    }
    acc[doc.version].push(doc);
    return acc;
  }, {} as Record<number, Documento[]>);

  const versionesOrdenadas = Object.keys(documentosPorVersion)
    .map(Number)
    .sort((a, b) => b - a);

  // Si la fase es "tema", mostrar solo vista de pendientes sin toggle
  const mostrarSoloPendientes = fase === 'tema';

  return (
    <div className={styles.entregasContainer}>
      
      {!mostrarSoloPendientes && (
        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleOption} ${vistaActual === 'ciclos' ? styles.active : ''}`}
            onClick={() => setVistaActual('ciclos')}
          >
            Entregas por ciclo
          </button>
          <button
            className={`${styles.toggleOption} ${vistaActual === 'pendientes' ? styles.active : ''}`}
            onClick={() => setVistaActual('pendientes')}
          >
            Ver pendientes
          </button>
        </div>
      )}

      {mostrarSoloPendientes || vistaActual === 'pendientes' ? (
        // Vista con pendientes primero
        documentosOrdenados.map((doc) => (
          <Entrega
            key={doc.id}
            id={doc.id}
            titulo={doc.titulo}
            version={doc.version}
            estado={doc.estado}
            fase={fase}
            justificacion={doc.justificacion || undefined}
            fechaEntrega={doc.created_at}
            estudiantes={doc.proyecto.estudiantes}
            file={doc.file}
            tipo={doc.tipo}
            onRevisar={onRevisar}
          />
        ))
      ) : (
        // Vista agrupada por ciclos
        versionesOrdenadas.map((version) => (
          <div key={version}>
            <h3 className={styles.cicloTitle}>
              <div className={styles.cicloIconWrapper}>
                <img src="/cycle.svg" alt="" className={styles.cicloIcon} />
              </div>
              Ciclo {version}
            </h3>
            {documentosPorVersion[version].map((doc) => (
              <Entrega
                key={doc.id}
                id={doc.id}
                titulo={doc.titulo}
                version={doc.version}
                estado={doc.estado}
                fase={fase}
                justificacion={doc.justificacion || undefined}
                fechaEntrega={doc.created_at}
                estudiantes={doc.proyecto.estudiantes}
                file={doc.file}
                tipo={doc.tipo}
                onRevisar={onRevisar}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}