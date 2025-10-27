// src/components/RevisionSidebar.tsx
import React, { useState } from 'react';
import type { EstadoRevision } from './DocumentoLayoutClientTema';
import ConfirmacionModal from './ConfirmacionModal';
import NotaCompletaModal from './NotaCompletaModal';
import styles from './style/RevisionSidebar.module.css';
import { useEffect } from 'react';
import { cambiarEstadoDocumento } from '@/services/documentos';

interface RevisionSidebarProps {
  datosCache: any | null;
  estado: EstadoRevision;
  notaRechazo: string;
  onAprobar: () => void;
  onRechazar: (nota: string) => void;
  onRevisarDeNuevo: () => void;
  onSiguiente: () => void;
}

const RevisionSidebar: React.FC<RevisionSidebarProps> = ({
  datosCache,
  estado,
  notaRechazo,
  onAprobar,
  onRechazar,
  onRevisarDeNuevo,
  onSiguiente
}) => {
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [accionConfirmacion, setAccionConfirmacion] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [notaTemporal, setNotaTemporal] = useState('');
  const [showNotaCompleta, setShowNotaCompleta] = useState(false);
  const [mostrarCampoNota, setMostrarCampoNota] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  console.log('Datos del cache en RevisionSidebar:', datosCache);

  // Sincronizar nota temporal si ya existe una justificación
  useEffect(() => {
    if (datosCache?.estado === 'rechazado' && datosCache?.justificacion) {
      setNotaTemporal(datosCache.justificacion);
    }
  }, [datosCache]);

  useEffect(() => {
    if (estado === 'pendiente') {
      setNotaTemporal('');
      setMostrarCampoNota(false);
      setShowConfirmacion(false);
      setShowNotaCompleta(false);
      setAccionConfirmacion('aprobar');
    }
  }, [estado]);

  const handleAprobarClick = () => {
    // Si ya está aprobado, no hacer nada
    if (datosCache?.estado === 'aprobado') {
      return;
    }
    setAccionConfirmacion('aprobar');
    setShowConfirmacion(true);
  };

  const handleRechazarClick = () => {
    // Si ya está rechazado, no hacer nada
    if (datosCache?.estado === 'rechazado') {
      return;
    }

    if (!mostrarCampoNota) {
      setMostrarCampoNota(true);
      return;
    }
    
    if (!notaTemporal.trim()) {
      alert('Debe escribir una nota justificatoria para rechazar el tema');
      return;
    }
    
    setAccionConfirmacion('rechazar');
    setShowConfirmacion(true);
  };

  const handleConfirmar = async () => {
    setShowConfirmacion(false);
    setIsLoading(true);
    
    try {
      if (accionConfirmacion === 'aprobar') {
        const resultado = await cambiarEstadoDocumento(datosCache.id, 'aprobado');
        if (resultado.success) {
          onAprobar();
        } else {
          alert(`Error al aprobar: ${resultado.error}`);
          // Podrías considerar revertir el estado local aquí si falla
        }
      } else {
        const resultado = await cambiarEstadoDocumento(
          datosCache.id, 
          'rechazado', 
          notaTemporal
        );
        if (resultado.success) {
          onRechazar(notaTemporal);
          setNotaTemporal('');
          setMostrarCampoNota(false);
        } else {
          alert(`Error al rechazar: ${resultado.error}`);
        }
      }
    } catch (error) {
      console.error('Error en confirmación:', error);
      alert('Error al procesar la acción');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelarNota = () => {
    setMostrarCampoNota(false);
    setNotaTemporal('');
  };

  const truncarNota = (nota: string, maxLength: number = 80) => {
    if (nota.length <= maxLength) return nota;
    return nota.substring(0, maxLength) + '...';
  };

  // Determinar si los botones deben estar deshabilitados
  const isAprobarDisabled = datosCache?.estado === 'aprobado' || isLoading;
  const isRechazarDisabled = datosCache?.estado === 'rechazado' || isLoading;

  return (
    <div className={styles.sidebar}>
      <div className={styles.studentInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Estudiante</span>
            <span className={styles.value}>{datosCache?.estudiante || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>CU</span>
            <span className={styles.value}>{datosCache?.cu || 'N/A'}</span>
          </div>
        </div>
        <div className={styles.carreraItem}>
          <span className={styles.label}>Carrera</span>
          <span className={styles.value}>{datosCache?.carrera || 'N/A'}</span>
        </div>
        
        {/* Mostrar estado actual del documento */}
        <div className={styles.estadoActual}>
          <span className={styles.label}>Estado actual:</span>
          <span className={`${styles.value} ${
            datosCache?.estado === 'aprobado' ? styles.estadoAprobado :
            datosCache?.estado === 'rechazado' ? styles.estadoRechazado :
            styles.estadoPendiente
          }`}>
            {datosCache?.estado || 'pendiente'}
          </span>
        </div>
      </div>

      <div className={styles.formSection}>
        {estado === 'pendiente' ? (
          <>
            {mostrarCampoNota && (
              <div className={styles.notaSection}>
                <label className={styles.notaLabel}>Nota justificatoria</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Escriba la razón del rechazo..."
                  value={notaTemporal}
                  onChange={(e) => setNotaTemporal(e.target.value)}
                  rows={6}
                  autoFocus
                  disabled={isLoading}
                />
                <button 
                  onClick={handleCancelarNota}
                  className={styles.cancelarNotaBtn}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
              </div>
            )}

            {!mostrarCampoNota && (
              <div className={styles.buttonGroup}>
                <button 
                  onClick={handleAprobarClick}
                  className={styles.aprobarBtn}
                  disabled={isAprobarDisabled}
                >
                  {isLoading ? 'Procesando...' : 
                   datosCache?.estado === 'aprobado' ? 'Ya Aprobado' : 'Aprobar Tema'}
                </button>
                <button 
                  onClick={handleRechazarClick}
                  className={styles.rechazarBtn}
                  disabled={isRechazarDisabled}
                >
                  {datosCache?.estado === 'rechazado' ? 'Ya Rechazado' : 'Rechazar Tema'}
                </button>
              </div>
            )}

            {mostrarCampoNota && (
              <button 
                onClick={handleRechazarClick}
                className={styles.confirmarRechazoBtn}
                disabled={!notaTemporal.trim() || isLoading}
              >
                {isLoading ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            )}
          </>
        ) : (
          <div className={styles.resultadoContainer}>
            {estado === 'aprobado' ? (
              <div className={styles.aprobadoBox}>
                <span className={styles.statusText}>Tema Aprobado</span>
              </div>
            ) : (
              <div className={styles.rechazadoBox}>
                <span className={styles.statusText}>Tema Rechazado</span>
                <div className={styles.notaBox}>
                  <p className={styles.notaTexto}>{truncarNota(notaRechazo)}</p>
                  {notaRechazo.length > 80 && (
                    <button 
                      onClick={() => setShowNotaCompleta(true)}
                      className={styles.verMasBtn}
                    >
                      Ver completa
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <button 
              onClick={onRevisarDeNuevo}
              className={styles.revisarBtn}
              disabled={isLoading}
            >
              Revisar de nuevo
            </button>
          </div>
        )}
      </div>

      <div className={styles.footerSection}>
        <button 
          onClick={onSiguiente}
          className={styles.siguienteBtn}
          disabled={isLoading}
        >
          Siguiente tema →
        </button>
      </div>

      {showConfirmacion && (
        <ConfirmacionModal
          accion={accionConfirmacion}
          onConfirmar={handleConfirmar}
          onCancelar={() => setShowConfirmacion(false)}
        />
      )}

      {showNotaCompleta && (
        <NotaCompletaModal
          nota={notaRechazo}
          onCerrar={() => setShowNotaCompleta(false)}
        />
      )}
    </div>
  );
};

export default RevisionSidebar;