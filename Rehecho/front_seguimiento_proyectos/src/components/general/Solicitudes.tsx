'use client';

import { useState } from 'react';
import { responderSolicitud } from '@/services/solicitudes';
import styles from './styles/Solicitudes.module.css';

interface Usuario {
  id: number;
  cu: string;
  usuario: {
    nombre: string;
    apellido: string;
  };
}

interface Proyecto {
  id: number;
  titulo: string;
}

interface Solicitud {
  id: number;
  tipo: 'invitar' | 'unirse';
  proyecto_id: number;
  emisor_id: number;
  receptor_id: number;
  titulo: string;
  aprobacion_receptor: 'pendiente' | 'aceptado' | 'rechazado';
  aprobacion_docente: 'pendiente' | 'aceptado' | 'rechazado';
  fecha_envio: string;
  receptor?: Usuario;
  emisor?: Usuario;
  proyecto: Proyecto;
}

interface SolicitudesData {
  enviadas?: Solicitud[];
  recibidas?: Solicitud[];
}

interface SolicitudesProps {
  solicitudes: SolicitudesData | Solicitud[];
  onSolicitudRespondida?: () => void;
  rol?: 'estudiante' | 'docente';
}

const Solicitudes: React.FC<SolicitudesProps> = ({ 
  solicitudes, 
  onSolicitudRespondida,
  rol = 'estudiante'
}) => {
  // Normalizar solicitudes según el rol
  const solicitudesNormalizadas: SolicitudesData = rol === 'docente'
    ? { enviadas: [], recibidas: Array.isArray(solicitudes) ? solicitudes : [] }
    : Array.isArray(solicitudes)
    ? { enviadas: [], recibidas: solicitudes }
    : solicitudes;

  const [solicitudesState, setSolicitudesState] = useState<SolicitudesData>(solicitudesNormalizadas);
  const [loading, setLoading] = useState<number | null>(null);

  const manejarRespuesta = async (solicitudId: number, respuesta: 'aceptado' | 'rechazado') => {
    setLoading(solicitudId);
    try {
      await responderSolicitud(solicitudId, respuesta);
      
      setSolicitudesState(prev => ({
        ...prev,
        recibidas: (prev.recibidas || []).map(sol => 
          sol.id === solicitudId 
            ? { 
                ...sol, 
                ...(rol === 'docente' 
                  ? { aprobacion_docente: respuesta }
                  : { aprobacion_receptor: respuesta }
                )
              }
            : sol
        )
      }));

      onSolicitudRespondida?.();
    } catch (error) {
      console.error('Error al responder solicitud:', error);
      alert('Error al responder la solicitud: ' + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const obtenerClaseEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return styles.pending;
      case 'aceptado': return styles.approved;
      case 'rechazado': return styles.rejected;
      default: return styles.pending;
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptado': return 'Aceptado';
      case 'rechazado': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  const totalSolicitudes = (solicitudesState.enviadas?.length || 0) + (solicitudesState.recibidas?.length || 0);

  if (totalSolicitudes === 0) {
    return (
      <div className={styles.requestsSection}>
        <h2 className={styles.sectionTitle}>Solicitudes</h2>
        <div className={styles.requestsList}>
          <div className={styles.emptyState}>
            <p>No tienes solicitudes pendientes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.requestsSection}>

      <div className={styles.requestsList}>
        <h2 className={styles.sectionTitle}>Solicitudes</h2>
        {/* Solicitudes Enviadas - solo para estudiantes */}
        {rol === 'estudiante' && solicitudesState.enviadas?.map((solicitud) => (
          <div key={solicitud.id} className={styles.requestItem}>
            <div className={styles.requestHeader}>
              <div className={styles.requestTitle}>Solicitud #{solicitud.id}</div>
              <div className={styles.requestDate}>{formatearFecha(solicitud.fecha_envio)}</div>
            </div>
            <div className={styles.requestMessage}>
              {solicitud.tipo === 'invitar' 
                ? `Invitación a ${solicitud.receptor?.usuario.nombre} ${solicitud.receptor?.usuario.apellido} para unirse a mi proyecto`
                : `Solicitud para unirme al proyecto ${solicitud.proyecto.titulo}`
              }
            </div>
            <div className={styles.requestStatus}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Docente:</span>
                <span className={`${styles.statusValue} ${obtenerClaseEstado(solicitud.aprobacion_docente)}`}>
                  {obtenerTextoEstado(solicitud.aprobacion_docente)}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>
                  {solicitud.tipo === 'invitar' ? 'Compañero:' : 'Propietario:'}
                </span>
                <span className={`${styles.statusValue} ${obtenerClaseEstado(solicitud.aprobacion_receptor)}`}>
                  {obtenerTextoEstado(solicitud.aprobacion_receptor)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Solicitudes Recibidas */}
        {solicitudesState.recibidas?.map((solicitud) => (
          <div key={solicitud.id} className={styles.requestItem}>
            <div className={styles.requestHeader}>
              <div className={styles.requestTitle}>Solicitud #{solicitud.id}</div>
              <div className={styles.requestDate}>{formatearFecha(solicitud.fecha_envio)}</div>
            </div>
            <div className={styles.requestMessage}>
              {rol === 'docente' ? (
                // Mensaje para docente
                solicitud.tipo === 'invitar'
                  ? `${solicitud.emisor?.usuario.nombre} ${solicitud.emisor?.usuario.apellido} invita a ${solicitud.receptor?.usuario.nombre} ${solicitud.receptor?.usuario.apellido} a unirse al proyecto ${solicitud.proyecto.titulo}`
                  : `${solicitud.emisor?.usuario.nombre} ${solicitud.emisor?.usuario.apellido} solicita unirse al proyecto ${solicitud.proyecto.titulo}`
              ) : (
                // Mensaje para estudiante
                solicitud.tipo === 'invitar' 
                  ? `Invitación para unirte al proyecto ${solicitud.proyecto.titulo}`
                  : `${solicitud.emisor?.usuario.nombre} ${solicitud.emisor?.usuario.apellido} solicita unirse a tu proyecto`
              )}
            </div>
            
            {(rol === 'docente' && solicitud.aprobacion_docente === 'pendiente') || 
             (rol === 'estudiante' && solicitud.aprobacion_receptor === 'pendiente') ? (
              <div className={styles.requestActions}>
                <button 
                  className={styles.acceptBtn}
                  onClick={() => manejarRespuesta(solicitud.id, 'aceptado')}
                  disabled={loading === solicitud.id}
                >
                  {loading === solicitud.id ? 'Procesando...' : 'Aceptar'}
                </button>
                <button 
                  className={styles.rejectBtn}
                  onClick={() => manejarRespuesta(solicitud.id, 'rechazado')}
                  disabled={loading === solicitud.id}
                >
                  {loading === solicitud.id ? 'Procesando...' : 'Rechazar'}
                </button>
              </div>
            ) : (
              <div className={styles.requestStatus}>
                {rol === 'docente' && (
                  <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>Tu decisión:</span>
                    <span className={`${styles.statusValue} ${obtenerClaseEstado(solicitud.aprobacion_docente)}`}>
                      {obtenerTextoEstado(solicitud.aprobacion_docente)}
                    </span>
                  </div>
                )}
                {rol === 'estudiante' && (
                  <>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Tu respuesta:</span>
                      <span className={`${styles.statusValue} ${obtenerClaseEstado(solicitud.aprobacion_receptor)}`}>
                        {obtenerTextoEstado(solicitud.aprobacion_receptor)}
                      </span>
                    </div>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Docente:</span>
                      <span className={`${styles.statusValue} ${obtenerClaseEstado(solicitud.aprobacion_docente)}`}>
                        {obtenerTextoEstado(solicitud.aprobacion_docente)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Solicitudes;