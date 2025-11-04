import { useState, useEffect } from 'react';
import { subirFinal } from '@/services/finales';
import { obtenerTags, crearTag } from '@/services/tags';
import { editarActividad } from '@/services/actividades';
import { useRouter } from 'next/navigation';
import styles from './styles/TrabajoFinal.module.css';

type TrabajoFinalRole = 'docente' | 'estudiante';

interface Actividad {
  id: number;
  nombre: string;
  elementos: string[];
  descripcion?: string;
  fecha_creacion: string;
  estado: string;
  grupo_id: number;
  fase: string;
  es_final: boolean;
}

interface TrabajoFinalProps {
  actividad: Actividad;
  grado: string;
  rol: TrabajoFinalRole;
  proyectoId?: number;
  carrera?: string;
  año?: number;
  onFinalSubido?: () => void;
  onActividadActualizada?: () => void;
}

interface Tag {
  id: number;
  nombre: string;
}

export default function TrabajoFinal({
  actividad,
  grado,
  rol,
  proyectoId,
  carrera,
  año,
  onFinalSubido,
  onActividadActualizada
}: TrabajoFinalProps) {
  const router = useRouter();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsSeleccionados, setTagsSeleccionados] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargandoTags, setCargandoTags] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [mostrarCrearTag, setMostrarCrearTag] = useState(false);
  const [nuevoTagNombre, setNuevoTagNombre] = useState('');
  const [creandoTag, setCreandoTag] = useState(false);

  const esCerrado = actividad.estado === 'cerrado';

  useEffect(() => {
    if (modalAbierto && rol === 'estudiante') {
      cargarTags();
    }
  }, [modalAbierto, rol]);

  const cargarTags = async () => {
    setCargandoTags(true);
    try {
      const data = await obtenerTags();
      setTags(data);
    } catch (error) {
      console.error('Error cargando tags:', error);
      setError('Error al cargar las categorías');
    } finally {
      setCargandoTags(false);
    }
  };

  const toggleEstadoActividad = async () => {
    setCambiandoEstado(true);
    try {
      const nuevoEstado = esCerrado ? 'activo' : 'cerrado';
      await editarActividad(actividad.id, { estado: nuevoEstado });

      if (onActividadActualizada) {
        onActividadActualizada();
      }
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      setError(err.message || 'Error al cambiar el estado de la actividad');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const abrirModal = () => {
    if (esCerrado && rol === 'estudiante') {
      setError('Las entregas están cerradas para este trabajo final');
      return;
    }
    setModalAbierto(true);
    setTitulo('');
    setArchivo(null);
    setTagsSeleccionados([]);
    setError(null);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTitulo('');
    setArchivo(null);
    setTagsSeleccionados([]);
    setError(null);
    setMostrarCrearTag(false);
    setNuevoTagNombre('');
  };

  const cerrarConfirmacion = () => {
    setConfirmacionAbierta(false);
    if (onFinalSubido) {
      onFinalSubido();
    }
  };

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        setArchivo(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo excede el tamaño máximo de 10MB');
        setArchivo(null);
        return;
      }
      setArchivo(file);
      setError(null);
    }
  };

  const toggleTag = (tagId: number) => {
    setTagsSeleccionados(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const manejarCrearTag = async () => {
    const nombreTrimmed = nuevoTagNombre.trim();
    
    if (!nombreTrimmed) {
      setError('Por favor ingresa un nombre para la categoría');
      return;
    }

    // Verificar si ya existe
    const existente = tags.find(
      tag => tag.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
    );
    
    if (existente) {
      setError('Esta categoría ya existe');
      return;
    }

    setCreandoTag(true);
    setError(null);

    try {
      const nuevoTag = await crearTag({ nombre: nombreTrimmed });
      
      // Agregar el nuevo tag a la lista
      setTags(prev => [...prev, nuevoTag]);
      
      // Seleccionarlo automáticamente
      setTagsSeleccionados(prev => [...prev, nuevoTag.id]);
      
      // Limpiar y cerrar el formulario
      setNuevoTagNombre('');
      setMostrarCrearTag(false);
    } catch (err: any) {
      console.error('Error creando tag:', err);
      setError(err.message || 'Error al crear la categoría');
    } finally {
      setCreandoTag(false);
    }
  };

  const manejarSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!archivo || !titulo.trim() || !proyectoId || !carrera || !año) {
    setError('Por favor completa todos los campos');
    return;
  }

  if (tagsSeleccionados.length === 0) {
    setError('Por favor selecciona al menos una categoría');
    return;
  }

  console.log('=== DATOS ANTES DE ENVIAR ===');
  console.log('📄 Archivo:', {
    nombre: archivo.name,
    tipo: archivo.type,
    tamaño: archivo.size
  });
  console.log('📦 Props recibidas:', {
    proyectoId,
    carrera,
    año,
    fase: actividad.fase,
    grado
  });
  console.log('📝 Datos del formulario:', {
    titulo,
    tagsSeleccionados
  });

  setSubiendo(true);
  setError(null); // Limpiar error anterior

  try {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('titulo', titulo.trim());
    formData.append('carrera', carrera);
    formData.append('anio', año.toString());
    formData.append('fase', actividad.fase);
    formData.append('actividad_id', actividad.id.toString());
    formData.append('grado', grado);
    formData.append('proyecto_id', proyectoId.toString());
    formData.append('tags', JSON.stringify(tagsSeleccionados));

    console.log('=== CONTENIDO DEL FORMDATA ===');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    const resultado = await subirFinal(formData);
    console.log('✅ Resultado de la subida:', resultado);

    if (resultado.success) {
      cerrarModal();
      setConfirmacionAbierta(true);
      localStorage.setItem('finalActual', JSON.stringify(resultado));
    } else {
      setError(resultado.error || 'Error al subir el documento final');
    }
  } catch (err: any) {
    console.error('❌ Error en manejarSubmit:', err);
    // Mostrar el mensaje de error específico del backend
    setError(err.message || 'Error inesperado al subir el documento final');
  } finally {
    setSubiendo(false);
  }
};

  const verEntregas = () => {
    localStorage.setItem('actividadActual', JSON.stringify(actividad));
    const ruta = rol === 'docente' 
      ? '/dashboard/docente/actividad' 
      : '/dashboard/estudiante/actividad';
    router.push(ruta);
  };

  return (
    <>
      <div className={`${styles.finalCard} ${esCerrado ? styles.cerrado : ''}`}>
        <div className={styles.finalLeft}>
          <div className={styles.finalHeaderRow}>
            <div className={styles.finalTitle}>{actividad.nombre}</div>
          </div>
          <p className={styles.finalNote}>
            {actividad.descripcion || `Ya se han trabajado todos los apartados definidos al inicio del curso de ${grado} para la fase de ${actividad.fase}. 
            Es momento de subir el documento final, que contiene todos los apartados trabajados durante el curso, 
            incluir carátula con datos de autor: título, nombre completo, carrera, asesor, año.`}
          </p>
          <div className={styles.finalButtons}>
            <button className={styles.viewBtn} onClick={verEntregas}>
              Ver entregas
            </button>
            {rol === 'docente' && (
              <button
                className={styles.toggleEstadoBtn}
                onClick={toggleEstadoActividad}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? 'Cambiando...' : (esCerrado ? 'Habilitar entregas' : 'Cerrar entregas')}
              </button>
            )}
            {rol === 'estudiante' && (
              <button
                className={styles.uploadFinalBtn}
                onClick={abrirModal}
                disabled={esCerrado}
              >
                {esCerrado ? 'Entregas cerradas' : 'Subir trabajo final'}
              </button>
            )}
          </div>
          {esCerrado && rol === 'estudiante' && (
            <p className={styles.estadoAviso}>Las entregas están cerradas para este trabajo final</p>
          )}
        </div>
        <div className={styles.finalRight}>
          <p className={styles.finalMeta}>Apartados incluidos:</p>
          <div className={styles.finalTags}>
            {actividad.elementos.map((elemento, index) => (
              <span key={index} className={styles.tag}>
                {elemento}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de subida de trabajo final */}
      {modalAbierto && (
        <div className={styles.modal} onClick={cerrarModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Subir Trabajo Final</h2>
              <span className={styles.closeModal} onClick={cerrarModal}>&times;</span>
            </div>
            <div className={styles.submissionForm}>
              <div className={styles.formGroup}>
                <label htmlFor="finalTitle">Título del trabajo</label>
                <input
                  type="text"
                  id="finalTitle"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Sistema de gestión de proyectos escolares"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="finalFile">Archivo PDF</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="finalFile"
                    accept=".pdf"
                    onChange={manejarCambioArchivo}
                  />
                  <span className={styles.fileName}>
                    {archivo ? archivo.name : 'Ningún archivo seleccionado'}
                  </span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Categorías (selecciona al menos una)</label>
                {cargandoTags ? (
                  <p className={styles.loadingTags}>Cargando categorías...</p>
                ) : (
                  <>
                    <div className={styles.tagsContainer}>
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className={`${styles.tagCheckbox} ${tagsSeleccionados.includes(tag.id) ? styles.selected : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={tagsSeleccionados.includes(tag.id)}
                            onChange={() => toggleTag(tag.id)}
                          />
                          <span className={styles.tagLabel}>{tag.nombre}</span>
                        </label>
                      ))}
                    </div>
                    
                    {!mostrarCrearTag ? (
                      <button
                        type="button"
                        className={styles.addTagBtn}
                        onClick={() => setMostrarCrearTag(true)}
                      >
                        + Crear nueva categoría
                      </button>
                    ) : (
                      <div className={styles.crearTagForm}>
                        <input
                          type="text"
                          placeholder="Nombre de la nueva categoría"
                          value={nuevoTagNombre}
                          onChange={(e) => setNuevoTagNombre(e.target.value)}
                          className={styles.crearTagInput}
                          maxLength={50}
                        />
                        <div className={styles.crearTagButtons}>
                          <button
                            type="button"
                            className={styles.crearTagCancelBtn}
                            onClick={() => {
                              setMostrarCrearTag(false);
                              setNuevoTagNombre('');
                              setError(null);
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className={styles.crearTagSubmitBtn}
                            onClick={manejarCrearTag}
                            disabled={creandoTag}
                          >
                            {creandoTag ? 'Creando...' : 'Crear'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cerrarModal}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={manejarSubmit}
                  disabled={subiendo || cargandoTags}
                >
                  {subiendo ? 'Subiendo...' : 'Entregar trabajo final'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmacionAbierta && (
        <div className={styles.modal} onClick={cerrarConfirmacion}>
          <div className={`${styles.modalContent} ${styles.confirmation}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successIcon}>✓</div>
            <h2>¡Trabajo Final Entregado!</h2>
            <p>Tu trabajo final ha sido enviado correctamente.</p>
            <button className={styles.okBtn} onClick={cerrarConfirmacion}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}