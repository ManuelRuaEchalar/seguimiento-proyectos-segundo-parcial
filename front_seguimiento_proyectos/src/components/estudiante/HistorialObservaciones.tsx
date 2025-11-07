import { useState, useMemo } from 'react';
import styles from './styles/HistorialObservaciones.module.css';

interface Observacion {
  id: number;
  content_text: string;
  comment_text: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  bounding_page: number;
  correccion_id?: number;
  observacion_id?: number;
}

interface Correccion {
  id: number;
  content_text: string;
  comment_text: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  bounding_page: number;
  observacion_id: number;
}

interface Documento {
  id: number;
  observaciones: Observacion[];
  correcciones: Correccion[];
}

interface HiloItem {
  tipo: 'observacion' | 'correccion';
  data: Observacion | Correccion;
  nivel: number;
  hijos?: HiloItem[];
}

interface Props {
  documentos: Documento[];
}

export default function HistorialObservaciones({ documentos }: Props) {
  const [hilosExpandidos, setHilosExpandidos] = useState<Set<number>>(new Set());

  // Extraer todas las observaciones y correcciones
  const { observaciones, correcciones } = useMemo(() => {
    const obs: Observacion[] = [];
    const corr: Correccion[] = [];

    documentos.forEach(doc => {
      if (doc.observaciones) obs.push(...doc.observaciones);
      if (doc.correcciones) corr.push(...doc.correcciones);
    });

    return { observaciones: obs, correcciones: corr };
  }, [documentos]);

  // Construir hilos desde observaciones raíz
  const hilos = useMemo(() => {
    // Encontrar observaciones raíz (sin correccion_id)
    const observacionesRaiz = observaciones.filter(obs => !obs.correccion_id);

    // Construir cada hilo recursivamente
    const construirHilo = (obs: Observacion, nivel: number = 0): HiloItem => {
      const item: HiloItem = {
        tipo: 'observacion',
        data: obs,
        nivel,
        hijos: []
      };

      // Buscar corrección para esta observación
      const correccion = correcciones.find(c => c.observacion_id === obs.id);
      
      if (correccion) {
        const correccionItem: HiloItem = {
          tipo: 'correccion',
          data: correccion,
          nivel: nivel + 1,
          hijos: []
        };

        // Si la corrección fue rechazada, buscar la observación de rechazo
        if (correccion.estado === 'rechazado') {
          const obsRechazo = observaciones.find(o => o.correccion_id === correccion.id);
          
          if (obsRechazo) {
            // Recursión: construir el resto del hilo
            correccionItem.hijos = [construirHilo(obsRechazo, nivel + 2)];
          }
        }

        item.hijos = [correccionItem];
      }

      return item;
    };

    return observacionesRaiz.map(obs => construirHilo(obs));
  }, [observaciones, correcciones]);

  const toggleHilo = (hiloId: number) => {
    setHilosExpandidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hiloId)) {
        newSet.delete(hiloId);
      } else {
        newSet.add(hiloId);
      }
      return newSet;
    });
  };

  const contarRespuestas = (item: HiloItem): number => {
    let count = item.hijos?.length || 0;
    item.hijos?.forEach(hijo => {
      count += contarRespuestas(hijo);
    });
    return count;
  };

  const renderItem = (item: HiloItem, hiloRaizId: number, itemId: string) => {
    const esObservacion = item.tipo === 'observacion';
    const data = item.data;
    const tieneHijos = item.hijos && item.hijos.length > 0;
    const estaExpandido = hilosExpandidos.has(parseInt(itemId));
    const claseNivel = item.nivel > 0 ? `nivel-${Math.min(item.nivel, 3)}` : '';
    const claseTipo = esObservacion ? 'docente' : 'estudiante';
    const tipoTexto = esObservacion ? 'Observación' : 'Corrección';
    const numRespuestas = contarRespuestas(item);

    return (
      <div key={itemId}>
        <div className={`${styles.item} ${styles[claseNivel]} ${styles[claseTipo]}`}>
          <div className={styles.contenido}>
            <div className={styles.headerLinea}>
              <div className={styles.tipoDoc}>
                <span className={styles.tipo}>{tipoTexto}</span>
                <span className={styles.docBadge}>
                  ID {data.id} • Pág {data.bounding_page}
                </span>
              </div>
              <span className={`${styles.estadoChip} ${styles[data.estado]}`}>
                {data.estado.charAt(0).toUpperCase() + data.estado.slice(1)}
              </span>
            </div>
            <div className={styles.textoPrincipal}>{data.content_text}</div>
            {data.comment_text && (
              <div className={styles.comentario}>
                <span>{data.comment_text}</span>
              </div>
            )}
          </div>
        </div>

        {tieneHijos && (
          <>
            <button 
              className={styles.toggleBtn}
              onClick={() => toggleHilo(parseInt(itemId))}
            >
              <span className={`${styles.toggleIcon} ${estaExpandido ? styles.rotado : ''}`}>
                ▶
              </span>
              <span>
                {estaExpandido 
                  ? 'Ocultar respuestas' 
                  : `Ver ${numRespuestas} respuesta${numRespuestas > 1 ? 's' : ''}`
                }
              </span>
            </button>

            {estaExpandido && (
              <div>
                {item.hijos!.map((hijo, idx) => 
                  renderItem(hijo, hiloRaizId, `${itemId}-${idx}`)
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (hilos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          No hay observaciones en el historial
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {hilos.map((hilo, index) => (
        <div key={`hilo-${hilo.data.id}`} className={styles.hiloCompleto}>
          {renderItem(hilo, hilo.data.id, `${hilo.data.id}`)}
        </div>
      ))}
    </div>
  );
}