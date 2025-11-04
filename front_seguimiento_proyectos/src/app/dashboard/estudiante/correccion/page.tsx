'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavbarRevision from '@/components/general/NavbarRevision';
import { fetchDoc } from '@/services/proyecto';
import { fetchTeacherObservations } from '@/services/docentes';
import styles from './page.module.css';
import { VisualizadorPDFCorrecciones } from '@/components/documento/VisualizadorPDFCorrecciones';

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
}

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

// Componente Modal de Instrucciones
function ModalInstrucciones({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Instrucciones para Corrección de Observaciones</h2>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.modalSection}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Revisa las observaciones pendientes</h3>
              <p className={styles.stepText}>
                En el panel lateral derecho encontrarás todas las observaciones que tu docente 
                realizó en tu documento anterior. Estas están organizadas y esperan ser corregidas.
              </p>
            </div>
          </div>

          <div className={styles.modalSection}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Selecciona una observación</h3>
              <p className={styles.stepText}>
                Haz clic en una observación de la lista. 
                Esto activará el modo de selección.
              </p>
            </div>
          </div>

          <div className={styles.modalSection}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Marca la corrección en tu documento</h3>
              <p className={styles.stepText}>
                Una vez activado el modo de selección, dirígete al documento PDF y{' '}
                <span className={styles.highlightText}>
                  selecciona y resalta el texto en tu documento nuevo que corresponde a la 
                  corrección de esa observación
                </span>
                . El texto seleccionado se resaltará para confirmar tu elección.
              </p>
            </div>
          </div>

          <div className={styles.modalSection}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Repite el proceso</h3>
              <p className={styles.stepText}>
                Continúa marcando las correcciones para cada observación pendiente hasta 
                completarlas todas. Una vez terminado, podrás finalizar el proceso de corrección.
              </p>
            </div>
          </div>

          <div className={styles.modalNote}>
            <strong>Nota:</strong> Debes marcar todas las observaciones pendientes antes de 
            poder finalizar la corrección del documento.
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.modalButton} onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RevisionEstudiantePage() {
  const router = useRouter();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [actividad, setActividad] = useState<any>(null);
  const [estudianteInfo, setEstudianteInfo] = useState<any>(null);
  const [observacionesYCorrecciones, setObservacionesYCorrecciones] = useState<any>(null);
  const [documentoBlob, setDocumentoBlob] = useState<{ blob: Blob; contentType: string } | null>(null);
  const [modoSeleccion, setModoSeleccion] = useState<boolean>(false);
  const [observacionSeleccionada, setObservacionSeleccionada] = useState<any>(null);
  const [observacionesPendientes, setObservacionesPendientes] = useState<any[]>([]);
  const [observacionesCorregidas, setObservacionesCorregidas] = useState<any[]>([]);
  
  // Estado para controlar el modal
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);

  // 🔹 1️⃣ Cargar los datos básicos desde localStorage
  useEffect(() => {
    const documentoStr = localStorage.getItem('documentoActual');
    const actividadStr = localStorage.getItem('actividadActual');
    const estudianteStr = localStorage.getItem('estudianteInfo');

    if (!documentoStr || !actividadStr || !estudianteStr) {
      console.warn('⚠️ Faltan datos en localStorage');
      router.push('/dashboard/docente/actividad');
      return;
    }

    const documentoData = JSON.parse(documentoStr);
    const actividadData = JSON.parse(actividadStr);
    const estudianteData = JSON.parse(estudianteStr);

    if (!documentoData?.id || !actividadData?.id || !estudianteData?.id) {
      console.error('❌ Datos inválidos en localStorage');
      return;
    }

    console.log('📘 Documento:', documentoData);
    console.log('📗 Actividad:', actividadData);
    console.log('📙 Estudiante (raw):', estudianteData);

    setDocumento(documentoData);
    setActividad(actividadData);
    setEstudianteInfo(estudianteData);
  }, [router]);

  // 🔹 2️⃣ Cuando estudianteInfo y documento estén listos, hacer fetch
  useEffect(() => {
    if (!documento || !actividad || !estudianteInfo) return;

    const fetchData = async () => {
      try {
        console.log('🔹 Cargando datos de observaciones...');
        console.log('👤 ID estudiante:', estudianteInfo.id);
        console.log('📄 ID documento:', documento.id);

        const [docData, obsData] = await Promise.all([
          fetchDoc(documento.id),
          fetchTeacherObservations(estudianteInfo.id, actividad.id),
        ]);

        setDocumentoBlob(docData);
        setObservacionesYCorrecciones(obsData);

        console.log('📑 Documento Blob cargado:', docData);
        console.log('🗒️ Observaciones y correcciones:', obsData);
      } catch (error) {
        console.error('❌ Error al obtener el documento o las observaciones:', error);
      }
    };

    fetchData();
  }, [documento, actividad, estudianteInfo]);

  // 🔹 3️⃣ Procesar observaciones para separar pendientes y corregidas
  useEffect(() => {
    if (!observacionesYCorrecciones) return;

    const todasObservaciones = observacionesYCorrecciones?.documentos?.flatMap((doc: any) => 
      doc.observaciones?.map((obs: any) => ({
        ...obs,
        documentoId: doc.id,
        documentoVersion: doc.version
      })) || []
    ) || [];

    console.log('📋 Todas las observaciones:', todasObservaciones);

    // Separar observaciones pendientes y corregidas
    const pendientes = todasObservaciones.filter((obs: any) => 
      obs.estado?.toLowerCase() === 'pendiente'
    );
    
    const corregidas = todasObservaciones.filter((obs: any) => 
      obs.estado?.toLowerCase() === 'rechazado' || obs.estado?.toLowerCase() === 'aprobado'
    );

    setObservacionesPendientes(pendientes);
    setObservacionesCorregidas(corregidas);

    console.log('🟡 Observaciones pendientes:', pendientes.length);
    console.log('🟢 Observaciones corregidas:', corregidas.length);
    
    // Mostrar instrucciones solo si hay observaciones pendientes
    if (pendientes.length > 0) {
      setMostrarInstrucciones(true);
    }
  }, [observacionesYCorrecciones]);

  // 🔹 4️⃣ Función para iniciar modo selección
  const iniciarModoSeleccion = (observacion: any) => {
    console.log('🎯 Iniciando modo selección para observación:', observacion);
    setObservacionSeleccionada(observacion);
    setModoSeleccion(true);
  };

  // 🔹 5️⃣ Función para finalizar corrección
  const handleFinalizarCorreccion = () => {
    const todasCorregidas = observacionesPendientes.length === 0;
    
    if (todasCorregidas) {
      console.log('✅ Todas las observaciones han sido corregidas');
      // Aquí iría la lógica para finalizar la corrección
      // Por ejemplo, cambiar estado del documento o redirigir
      router.push('/dashboard/estudiante/actividad');
    } else {
      console.warn('⚠️ Aún hay observaciones pendientes');
      alert('Aún hay observaciones pendientes por corregir');
    }
  };

  if (!documento || !estudianteInfo) {
    return <p>Cargando datos...</p>;
  }

  // 🔹 6️⃣ Preparar el estudiante en formato correcto
  const estudiante: Estudiante = {
    id: estudianteInfo.id,
    cu: estudianteInfo.cu,
    carrera: estudianteInfo.carrera,
    usuario: {
      nombre: estudianteInfo.usuario?.nombre ?? '',
      apellido: estudianteInfo.usuario?.apellido ?? '',
      email: estudianteInfo.usuario?.email ?? '',
    },
  };

  const nombreCompleto = `${estudiante.usuario.nombre} ${estudiante.usuario.apellido}`;

  const correccionesLocales =
    observacionesYCorrecciones?.documentos
      ?.find((doc: any) => doc.id === documento.id)
      ?.correcciones || [];

  const observacionesExternas =
    observacionesYCorrecciones?.documentos
      ?.filter((doc: any) => doc.id !== documento.id)
      ?.flatMap((doc: any) => doc.observaciones) || [];

  const correccionesExternas =
    observacionesYCorrecciones?.documentos
      ?.filter((doc: any) => doc.id !== documento.id)
      ?.flatMap((doc: any) => doc.correcciones) || [];

  console.log('📕 Observaciones Externas:', observacionesExternas);
  console.log('📝 Correcciones Locales:', correccionesLocales);
  console.log('📄 Correcciones Externas:', correccionesExternas);

  // 🔹 7️⃣ Construir infoProyecto
  const infoProyecto: infoProyecto = {
    codigoProyecto: estudianteInfo.proyecto_id,
    codigoDoc: documento.id,
  };

  return (
    <>
      {/* Modal de Instrucciones */}
      <ModalInstrucciones 
        isOpen={mostrarInstrucciones} 
        onClose={() => setMostrarInstrucciones(false)} 
      />

      <div className={styles.documentoPageLayout}>
        <NavbarRevision
          role="estudiante_correccion"
          version={documento.version}
          titulo={documento.titulo}
          nombreEstudiante={nombreCompleto}
          fase_proyecto={estudianteInfo.proyecto.fase_actual}
          proyecto_id={estudianteInfo.proyecto.id}
          documento_id={documento.id}
          fase={actividad.fase}
          es_final={actividad.es_final}
          codigoUniversitario={estudiante.cu}
          carrera={estudiante.carrera}
          onFinalizarCorreccion={handleFinalizarCorreccion}
          hayObservacionesPendientes={observacionesPendientes.length > 0}
        />

        <div className={styles.documentoBody}>
          {modoSeleccion && (
            <div className={styles.bannerModoSeleccion}>
              <div className={styles.bannerContent}>
                <div className={styles.bannerText}>
                  <strong>Modo selección activo</strong>
                  <span>
                    Selecciona <span className={styles.highlight}>y resalta en el documento el texto que has corregido</span> para la observación seleccionada
                  </span>
                </div>
                <button 
                  className={styles.bannerCancelButton}
                  onClick={() => {
                    setModoSeleccion(false);
                    setObservacionSeleccionada(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className={styles.pdfContainer}>
            {documentoBlob && (
              <VisualizadorPDFCorrecciones
                blob={documentoBlob.blob}
                observaciones={observacionesExternas}
                correcciones={correccionesLocales}
                infoProyecto={infoProyecto}
                modoSeleccion={modoSeleccion}
                observacionSeleccionada={observacionSeleccionada}
                onSeleccionCompletada={() => {
                  setModoSeleccion(false);
                  setObservacionSeleccionada(null);
                  
                  // Actualizar lista de observaciones
                  const observacionIndex = observacionesPendientes.findIndex(
                    obs => obs.id === observacionSeleccionada.id
                  );
                  
                  if (observacionIndex !== -1) {
                    const nuevaObservacion = {
                      ...observacionesPendientes[observacionIndex],
                      estado: 'corregida',
                      corregida: true
                    };
                    
                    setObservacionesPendientes(prev => 
                      prev.filter(obs => obs.id !== observacionSeleccionada.id)
                    );
                    setObservacionesCorregidas(prev => [...prev, nuevaObservacion]);
                  }
                }}
                observacionesPendientes={observacionesPendientes}
                observacionesCorregidas={observacionesCorregidas}
                onIniciarModoSeleccion={iniciarModoSeleccion}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}