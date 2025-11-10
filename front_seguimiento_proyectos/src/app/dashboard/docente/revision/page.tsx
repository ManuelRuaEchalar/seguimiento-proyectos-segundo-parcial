'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import NavbarRevision from '@/components/general/NavbarRevision';
import { fetchDoc, fetchProjectObservaciones, changeProyectoFase } from '@/services/proyecto';
import { fetchFinal } from '@/services/finales';
import { fetchTeacherObservations } from '@/services/docentes';
import { fetchObservaciones } from '@/services/observaciones';
import { fetchCorrecciones } from '@/services/correcciones';
import styles from './page.module.css';
import { VisualizadorPDF } from '@/components/documento/VisualizadorPDF';
import { VisualizadorPDFFinal } from '@/components/documento/VisualizadorPDFFinal';
import type { IHighlight } from '@/components/documento/react-pdf-highlighter';

interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
}

interface Estudiante {
  id: number;
  cu: string;
  carrera: string;
  usuario: Usuario;
}

interface Proyecto {
  id: number;
  titulo: string;
  fase: string;
  estudiantes: Estudiante[];
}

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  justificacion: string | null;
  created_at: string;
  file: string;
  proyecto: Proyecto;
  tags?: any[]; // Propiedad opcional que indica si es un documento final
}

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

export default function RevisionDocentePage() {
  const router = useRouter();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [actividad, setActividad] = useState<any>(null);
  const [observacionesYCorrecciones, setObservacionesYCorrecciones] = useState<any>(null);
  const [documentoBlob, setDocumentoBlob] = useState<{ blob: Blob; contentType: string } | null>(null);
  
  // Estados para el segundo visualizador
  const [secondBlob, setSecondBlob] = useState<Blob | null>(null);
  const [secondContentType, setSecondContentType] = useState<string | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<any | null>(null);
  const [secondInfoProyecto, setSecondInfoProyecto] = useState<infoProyecto | null>(null);
  const [secondObservaciones, setSecondObservaciones] = useState<any[] | null>(null);
  const [secondCorrecciones, setSecondCorrecciones] = useState<any[] | null>(null);
  
  // Estados para modales
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isApprovingDocument, setIsApprovingDocument] = useState(false);
  
  // Estado para observaciones del proyecto
  const [observacionesProyectoState, setObservacionesProyectoState] = useState<any[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Determinar si es un documento final (tiene tags)
  const esDocumentoFinal = useMemo(() => {
    return documento?.tags !== undefined && documento.proyecto.fase !=='tema';
  }, [documento]);

  // Determinar si es revisión final
  const esFinal = useMemo(() => {
    return actividad?.fase === 'tema' || actividad?.es_final === true || esDocumentoFinal;
  }, [actividad, esDocumentoFinal]);

  useEffect(() => {
    // Recuperar documento actual del localStorage
    const documentoStr = localStorage.getItem('documentoActual');
    if (!documentoStr) {
      console.warn('⚠️ No hay documentoActual en localStorage');
      router.push('/dashboard/docente/actividad');
      return;
    }

    const actividadStr = localStorage.getItem('actividadActual');
    if (!actividadStr) {
      console.warn('⚠️ No hay actividadActual en localStorage');
      router.push('/dashboard/docente/actividad');
      return;
    }

    const documentoData = JSON.parse(documentoStr);
    console.log('📄 documento guardado en localStorage:', documentoData);
    const actividadData = JSON.parse(actividadStr);

    if (!documentoData?.id) {
      console.error('❌ documento guardado no tiene un ID válido:', documentoData);
      return;
    }

    if (!actividadData?.id) {
      console.error('❌ actividad guardada no tiene un ID válido:', actividadData);
      return;
    }

    console.log('📘 documento en revision:', documentoData);
    setDocumento(documentoData);
    console.log('📗 actividad en revision:', actividadData);
    setActividad(actividadData);

    // Fetch documento y observaciones
    const fetchData = async () => {
      try {
        const estudiante = documentoData.proyecto.estudiantes[0];
        
        // Determinar si es documento final por la presencia de tags
        const esDocFinal = documentoData.tags !== undefined;
        
        let docData;
        if (esDocFinal) {
          console.log('📄 Obteniendo documento FINAL con ID:', documentoData.id);
          docData = await fetchFinal(documentoData.id);
        } else {
          console.log('📄 Obteniendo documento NORMAL con ID:', documentoData.id);
          docData = await fetchDoc(documentoData.id);
        }

        setDocumentoBlob(docData);

        // Solo obtener observaciones y correcciones si NO es documento final
        if (!esDocFinal) {
          const [obsData, obsProyecto] = await Promise.all([
            fetchTeacherObservations(estudiante.id, actividadData.id),
            fetchProjectObservaciones(documentoData.proyecto.id, documentoData.id)
          ]);

          setObservacionesYCorrecciones(obsData);
          setObservacionesProyectoState(obsProyecto);

          console.log("OBSERVACIONES Y CORRECCIONES DE LA API: ", obsData);
          console.log("OBSERVACIONES DEL PROYECTO: ", obsProyecto);
        } else {
          console.log("📋 Documento final - sin observaciones ni correcciones");
        }
      } catch (error) {
        console.error('❌ Error al obtener el documento o las observaciones:', error);
        setErrorCarga('No se pudo cargar el documento. Por favor, intente nuevamente.');
      }
    };

    fetchData();
  }, [router]);

  // Función para actualizar estado de observación localmente
  const actualizarEstadoObservacion = useCallback((observacionId: number, nuevoEstado: string) => {
    setObservacionesProyectoState(prevObs =>
      prevObs.map(obs =>
        obs.id === observacionId
          ? { ...obs, estado: nuevoEstado }
          : obs
      )
    );
    console.log(`✅ Estado de observación ${observacionId} actualizado a: ${nuevoEstado}`);
  }, []);

  // Función para manejar click en observación
  const handleObservationClick = useCallback(async (observacion: any) => {
    console.log("Clicked observation:", observacion);

    try {
      if (observacion.esDeOtraVersion) {
        const { blob: newBlob, contentType: newContentType } = await fetchDoc(observacion.documento_id);
        const newObs = await fetchObservaciones(observacion.documento_id);
        const newCorr = await fetchCorrecciones(observacion.documento_id);

        const newCorrWithString = newCorr.map((c: { observacion_id: any; }) => ({
          ...c,
          observacion_id: String(c.observacion_id)
        }));

        setSecondBlob(newBlob);
        setSecondContentType(newContentType);
        setSecondObservaciones(newObs);
        setSecondCorrecciones(newCorrWithString);
        setSecondInfoProyecto({
          codigoProyecto: documento!.proyecto.id,
          codigoDoc: observacion.documento_id,
        });
        setSelectedObservation({
          ...observacion,
          codigoDoc: observacion.documento_id
        });
      } else {
        setSelectedObservation({
          ...observacion,
          codigoDoc: documento!.id
        });
        setSecondBlob(null);
        setSecondContentType(null);
        setSecondObservaciones(null);
        setSecondCorrecciones(null);
        setSecondInfoProyecto(null);
      }
    } catch (error) {
      console.error('Error fetching second document:', error);
    }
  }, [documento]);

  // Función para manejar completar aprobación
  const handleApprovalComplete = useCallback(() => {
    setSelectedObservation(null);
    setSecondBlob(null);
    setSecondContentType(null);
    setSecondObservaciones(null);
    setSecondCorrecciones(null);
    setSecondInfoProyecto(null);
  }, []);

  // Función para manejar rechazo con nueva observación
  const handleRejectionWithNewObservation = useCallback(
    async (rejectedCorrection: any, nuevaObservacionAPI: any) => {
      if (!documento) return;
      
      try {
        // La observación YA fue creada por el backend
        // Solo necesitamos crear el highlight local basado en la respuesta
        console.log('📥 Nueva observación recibida del backend:', nuevaObservacionAPI);
        
        const newHighlight: IHighlight = {
          id: nuevaObservacionAPI.id.toString(),
          content: {
            text: nuevaObservacionAPI.content_text || rejectedCorrection.content.text || ''
          },
          position: {
            boundingRect: {
              x1: nuevaObservacionAPI.bounding_x1,
              y1: nuevaObservacionAPI.bounding_y1,
              x2: nuevaObservacionAPI.bounding_x2,
              y2: nuevaObservacionAPI.bounding_y2,
              width: nuevaObservacionAPI.bounding_x2 - nuevaObservacionAPI.bounding_x1,
              height: nuevaObservacionAPI.bounding_y2 - nuevaObservacionAPI.bounding_y1,
              pageNumber: nuevaObservacionAPI.bounding_page
            },
            rects: nuevaObservacionAPI.rects || rejectedCorrection.position.rects || [],
            pageNumber: nuevaObservacionAPI.bounding_page
          },
          comment: { 
            text: nuevaObservacionAPI.comment_text || '',
            emoji: "❌" 
          },
          estado: nuevaObservacionAPI.estado || 'pendiente',
          documento_id: nuevaObservacionAPI.documento_id,
          proyecto_id: nuevaObservacionAPI.proyecto_id,
          observacionId: nuevaObservacionAPI.id.toString(),
          isCorreccion: false
        };
        
        console.log('✅ Highlight creado desde API:', newHighlight);
        
        // Actualizar el estado local para mostrar la nueva observación
        setObservacionesProyectoState(prevObs => [
          ...prevObs,
          nuevaObservacionAPI
        ]);
        
        // Limpia la vista
        handleApprovalComplete();
      } catch (error) {
        console.error('Error al procesar nueva observación:', error);
      }
    }, 
    [documento, handleApprovalComplete]
  );

  // Función para aprobar documento
  const handleApproveDocument = async () => {
    if (!documento) return;
    
    setIsApprovingDocument(true);
    try {
      await changeProyectoFase(documento.proyecto.id);
      alert('Documento aprobado exitosamente. El estudiante puede avanzar a la siguiente fase.');
      router.push('/dashboard/docente/actividad');
    } catch (error) {
      console.error('Error al aprobar documento:', error);
      alert('Error al aprobar el documento. Por favor, intente nuevamente.');
    } finally {
      setIsApprovingDocument(false);
      setShowApprovalModal(false);
    }
  };

  // Memoizar observaciones locales y externas
  const observacionesLocales = useMemo(() => {
    if (!observacionesYCorrecciones || !documento || esDocumentoFinal) return [];
    
    return observacionesYCorrecciones.documentos
      ?.find((doc: any) => doc.id === documento.id)
      ?.observaciones || [];
  }, [observacionesYCorrecciones, documento, esDocumentoFinal]);

  const correccionesLocales = useMemo(() => {
    if (!observacionesYCorrecciones || !documento || esDocumentoFinal) return [];

    const correcciones = observacionesYCorrecciones.documentos
      ?.find((doc: any) => doc.id === documento.id)
      ?.correcciones || [];

    // Filtrar y mapear
    return correcciones
      .filter((c: any) => c.estado !== 'rechazado') // ❌ excluir rechazadas
      .map((c: any) => ({
        ...c,
        observacion_id: String(c.observacion_id),
      }));
  }, [observacionesYCorrecciones, documento, esDocumentoFinal]);

  const observacionesExternas = useMemo(() => {
    if (!documento || esDocumentoFinal || !observacionesYCorrecciones) return [];
    
    // Obtener los IDs de todos los documentos de la actividad actual
    const documentosActividadIds = observacionesYCorrecciones.documentos?.map((doc: any) => doc.id) || [];
    
    console.log('📄 IDs de documentos en la actividad actual:', documentosActividadIds);
    
    const result = (observacionesProyectoState || [])
      .filter(obs => {
        // Debe ser del mismo proyecto
        const esDelMismoProyecto = obs.proyecto_id === documento.proyecto.id;
        // Debe pertenecer a un documento de la actividad actual
        const esDeActividadActual = documentosActividadIds.includes(obs.documento_id);
        // No debe ser del documento actual
        const noEsDocumentoActual = obs.documento_id !== documento.id;
        
        return esDelMismoProyecto && esDeActividadActual && noEsDocumentoActual;
      })
      .map(obs => ({
        ...obs,
        comment: { text: obs.commentText || obs.comment?.text || '' },
        content: { text: obs.contentText || obs.content?.text || '' },
        position: {
          pageNumber: obs.boundingPage || obs.position?.pageNumber || 1
        },
        esDeOtraVersion: true
      }));

    console.log('📋 Observaciones de otras versiones:', {
      total: result.length,
      datos: result
    });

    return result;
  }, [observacionesProyectoState, documento, esDocumentoFinal, observacionesYCorrecciones]);

  // Calcular estadísticas de correcciones
  const estadisticasCorrecciones = useMemo(() => {
    const total = correccionesLocales.length;
    const aprobadas = correccionesLocales.filter((c: { estado: string; }) => c.estado === 'aprobado').length;
    const rechazadas = correccionesLocales.filter((c: { estado: string; }) => c.estado === 'rechazado').length;
    const pendientes = correccionesLocales.filter((c: { estado: string; }) => c.estado === 'pendiente').length;

    return { total, aprobadas, rechazadas, pendientes };
  }, [correccionesLocales]);

  if (!documento) {
    return null; // O un loading spinner
  }

  // Obtener datos del primer estudiante
  const estudiante = documento.proyecto.estudiantes[0];
  const nombreCompleto = `${estudiante.usuario.nombre} ${estudiante.usuario.apellido}`;

  const infoProyecto: infoProyecto = {
    codigoProyecto: documento.proyecto.id,
    codigoDoc: documento.id,
  };

  let role: 'docente_final' | 'docente' | 'estudiante' | 'estudiante_correccion';
  if (esFinal) {
    role = 'docente_final';
  } else {
    role = 'docente';
  }

  console.log(`total observaciones locales: ${observacionesLocales.length}`);
  console.log(`total observaciones externas: ${observacionesExternas.length}`);
  console.log('documento tags: ', documento.tags);
  console.log('Es documento final o no?', esDocumentoFinal);

  return (
    <div>
      <NavbarRevision
        role={role}
        documento_id={documento.id}
        proyecto_id={documento.proyecto.id}
        fase={actividad.fase}
        es_final={actividad.es_final}
        es_documento_final={esDocumentoFinal}
        version={documento.version}
        titulo={documento.titulo}
        fase_proyecto={documento.proyecto.fase}
        nombreEstudiante={nombreCompleto}
        codigoUniversitario={estudiante.cu}
        carrera={estudiante.carrera}
      />
      
      <div className={styles.documentoBody}>
        {errorCarga ? (
          // Mostrar mensaje de error si la carga falló
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            color: '#d32f2f',
            fontSize: '1.1rem'
          }}>
            <p> {errorCarga}</p>
          </div>
        ) : !documentoBlob ? (
          // Mostrar loading mientras carga
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            <p>Cargando documento...</p>
          </div>
        ) : esFinal ? (
          // Visualizador final simple para revisión de tema o final
          <div className={styles.pdfContainerFinal}>
            <VisualizadorPDFFinal
              blob={documentoBlob.blob}
              contentType={documentoBlob.contentType}
            />
          </div>
        ) : (
          // Visualizador dual para revisión con observaciones y correcciones
          <div className={`${styles.pdfContainer} ${secondBlob ? styles.dual : styles.single}`}>
            <div className={styles.pdfViewerWrapper}>
              <VisualizadorPDF
                blob={documentoBlob.blob}
                observaciones={observacionesLocales}
                observacionesOtrasVersiones={observacionesExternas}
                correcciones={correccionesLocales}
                infoProyecto={infoProyecto}
                selectedObservation={selectedObservation}
                contentType={documentoBlob.contentType}
                onObservationClick={handleObservationClick}
                onActualizarEstadoObservacion={actualizarEstadoObservacion}
                role={'docente'}
              />
            </div>

            {secondBlob && secondInfoProyecto && (
              <div className={styles.pdfViewerWrapper}>
                <VisualizadorPDF
                  blob={secondBlob}
                  observaciones={secondObservaciones ?? []}
                  doc_actual_id={infoProyecto.codigoDoc}
                  infoProyecto={secondInfoProyecto}
                  selectedObservation={selectedObservation}
                  contentType={secondContentType || 'application/pdf'}
                  onApprovalComplete={handleApprovalComplete}
                  onRejectionWithNewObservation={handleRejectionWithNewObservation}
                  onActualizarEstadoObservacion={actualizarEstadoObservacion}
                  role={'docente'}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}