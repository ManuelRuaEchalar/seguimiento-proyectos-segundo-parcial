import { useState } from 'react';
import { editarActividad } from '@/services/actividades';
import { subirDocumento } from '@/services/documentos';
import { useRouter } from 'next/navigation';
import styles from './styles/Actividad.module.css';

type ActividadRole = 'docente' | 'estudiante';

interface ActividadProps {
  actividad: {
    id: number;
    nombre: string;
    estado: string;
    fecha: string;
    elementos: string[];
    descripcion?: string;
  };
  estudianteId?: number;
  proyectoId?: number;
  rol: ActividadRole;
  fase?: string;
  onActividadActualizada: () => void;
  onVerEntregas: (actividadId: number) => void;
}

export default function Actividad({ 
  actividad,
  estudianteId,
  proyectoId,
  rol,
  fase,
  onActividadActualizada,
  onVerEntregas 
}: ActividadProps) {
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const manejarCerrarActividad = async () => {
    if (!confirm('¿Estás seguro de que quieres cerrar esta actividad?')) {
      return;
    }

    setCerrando(true);
    try {
      await editarActividad(actividad.id, { estado: 'cerrado' });
      onActividadActualizada();
    } catch (error) {
      console.error('Error cerrando actividad:', error);
      alert('Error al cerrar la actividad');
    } finally {
      setCerrando(false);
    }
  };

  const abrirModal = () => {
    setModalAbierto(true);
    setTitulo('');
    setArchivo(null);
    setError(null);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTitulo('');
    setArchivo(null);
    setError(null);
  };

  const cerrarConfirmacion = () => {
    setConfirmacionAbierta(false);
    onActividadActualizada();
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

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!archivo || !titulo.trim() || !proyectoId) {
      setError('Por favor completa todos los campos');
      return;
    }

    // 🔍 DEBUG MEJORADO
    console.log('📄 Información del archivo:', {
      nombre: archivo.name,
      tipo: archivo.type,
      tamaño: archivo.size,
      ultimaModificacion: archivo.lastModified
    });
    console.log('📦 Datos a enviar:', {
      proyectoId,
      actividadId: actividad.id,
      titulo
    });

    setSubiendo(true);
    setError(null);

    try {
      const resultado = await subirDocumento(archivo, proyectoId, actividad.id, titulo);
      console.log('✅ Resultado de la subida:', resultado);
      
      if (resultado.success) {
        cerrarModal();
        setConfirmacionAbierta(true);
        // Guardar en localStorage
        localStorage.setItem('documentoActual', JSON.stringify(resultado));
        if (resultado.version != 1 && fase != 'tema') {
              //redirigir a la página de revisión de entregas /documento
              router.push('/dashboard/estudiante/correccion');
        }
      } else {
        setError(resultado.error || 'Error al subir el documento');
      }
    } catch (err) {
      setError('Error inesperado al subir el documento');
      console.error(err);
    } finally {
      setSubiendo(false);
    }
  };

  const estaActiva = actividad.estado === 'activo';

  return (
    <>
      <div className={`${styles.activityCard} ${estaActiva ? styles.active : ''}`}>
        <div className={styles.activityLeft}>
          <div className={styles.activityHeaderRow}>
            <div className={styles.activityTitle}>{actividad.nombre}</div>
          </div>
          <p className={estaActiva ? styles.activityStatusActual : styles.activityStatus}>
            <b>{estaActiva ? 'En progreso' : 'Completada'}</b>
          </p>
          <p className={styles.activityDate}>{actividad.fecha}</p>
          <div className={styles.activityButtons}>
            <button className={styles.viewBtn} onClick={() => onVerEntregas(actividad.id)}>
              Ver entregas
            </button>
            {rol === 'docente' && estaActiva && (
              <button 
                className={styles.closeActivityBtn} 
                onClick={manejarCerrarActividad}
                disabled={cerrando}
              >
                {cerrando ? 'Cerrando...' : 'Cerrar actividad'}
              </button>
            )}
            {rol === 'estudiante' && estaActiva && (
              <button className={styles.newSubmissionBtn} onClick={abrirModal}>
                Nueva entrega
              </button>
            )}
          </div>
        </div>
        <div className={styles.activityRight}>
          <p className={`${styles.activityMeta} ${styles.number}`}>Se trabaja:</p>
          {fase === 'tema' ? (
            <p className={styles.activityDescription}>{actividad.descripcion}</p>
          ) : (
            <div className={styles.activityTags}>
              {actividad.elementos.map((elemento, index) => (
                <span key={index} className={styles.tag}>
                  {elemento}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de nueva entrega */}
      {modalAbierto && (
        <div className={styles.modal} onClick={cerrarModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nueva Entrega</h2>
              <span className={styles.closeModal} onClick={cerrarModal}>&times;</span>
            </div>
            <div className={styles.submissionForm}>
              <div className={styles.formGroup}>
                <label htmlFor="submissionTitle">Título de la entrega</label>
                <input
                  type="text"
                  id="submissionTitle"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Entrega perfil de proyecto"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="submissionFile">Archivo PDF</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="submissionFile"
                    accept=".pdf"
                    onChange={manejarCambioArchivo}
                  />
                  <span className={styles.fileName}>
                    {archivo ? archivo.name : 'Ningún archivo seleccionado'}
                  </span>
                </div>
              </div>
              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="button" className={styles.submitBtn} onClick={manejarSubmit} disabled={subiendo}>
                  {subiendo ? 'Subiendo...' : 'Entregar'}
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
            <h2>¡Entrega Exitosa!</h2>
            <p>Tu trabajo ha sido enviado correctamente.</p>
            <button className={styles.okBtn} onClick={cerrarConfirmacion}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}