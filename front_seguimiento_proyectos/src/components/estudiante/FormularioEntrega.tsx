import { useState } from 'react';
import { subirDocumento } from '@/services/documentos';
import { useRouter } from 'next/navigation';
import styles from './styles/FormularioEntrega.module.css';

interface FormularioEntregaProps {
  actividadId: number;
  proyectoId: number | null;
  fase?: string;
  onEntregaExitosa: () => void;
}

export default function FormularioEntrega({ 
  actividadId, 
  proyectoId,
  fase,
  onEntregaExitosa 
}: FormularioEntregaProps) {
    const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);

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

  const limpiarFormulario = () => {
    setTitulo('');
    setArchivo(null);
    setError(null);
    // Limpiar el input file
    const fileInput = document.getElementById('submissionFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const cerrarConfirmacion = () => {
    setConfirmacionAbierta(false);
    onEntregaExitosa();
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!archivo || !titulo.trim() || !proyectoId) {
      setError('Por favor completa todos los campos');
      return;
    }

    console.log('📄 Información del archivo:', {
      nombre: archivo.name,
      tipo: archivo.type,
      tamaño: archivo.size,
      ultimaModificacion: archivo.lastModified
    });
    console.log('📦 Datos a enviar:', {
      proyectoId,
      actividadId,
      titulo
    });

    setSubiendo(true);
    setError(null);

    try {
      const resultado = await subirDocumento(archivo, proyectoId, actividadId, titulo);
      
      if (resultado.success) {
        limpiarFormulario();
        setConfirmacionAbierta(true);
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

  return (
    <>
      <div className={styles.formularioContainer}>
        <h2 className={styles.formTitle}>Nueva Entrega</h2>
        <form className={styles.submissionForm} onSubmit={manejarSubmit}>
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
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={limpiarFormulario}
              disabled={subiendo}
            >
              Limpiar
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={subiendo}
            >
              {subiendo ? 'Subiendo...' : 'Entregar'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de confirmación */}
      {confirmacionAbierta && (
        <div className={styles.modal} onClick={cerrarConfirmacion}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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