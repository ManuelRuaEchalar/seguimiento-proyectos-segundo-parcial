'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './style/NavbarReview.module.css';
import type { Pendiente as PendienteType } from '@/types/types';

interface EstadisticasCorrecciones {
  total: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
}

interface NavbarReviewProps {
  datosCache: PendienteType;
  estadisticasCorrecciones: EstadisticasCorrecciones;
  onApproveDocument: () => void;
  isApprovingDocument?: boolean;
}

export default function NavbarReview({
  datosCache,
  estadisticasCorrecciones,
  onApproveDocument,
  isApprovingDocument = false
}: NavbarReviewProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleApproveClick = () => {
    setShowModal(true);
  };

  const handleConfirmApprove = () => {
    onApproveDocument();
    setShowModal(false);
  };

  const handleCancelApprove = () => {
    setShowModal(false);
  };

  const observacionesSinResolver = estadisticasCorrecciones.rechazadas + estadisticasCorrecciones.pendientes;
  const mostrarAdvertencia = observacionesSinResolver > 0;

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <button 
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Volver atrás"
          >
            ← Atrás
          </button>
        </div>

        <div className={styles.navbarCenter}>
          <div className={styles.activityTitle}>
            <span className={styles.documentVersion}>
              Versión {datosCache.version || '1'}
            </span>
            {datosCache.titulo}
          </div>
          <div className={styles.activityMeta}>
            <span className={styles.activityDate}>
              {datosCache.estudiante} • CU: {datosCache.cu}
            </span>
            <span className={styles.tag}>{datosCache.carrera}</span>
          </div>
        </div>

        <div className={styles.navbarRight}>
          <button 
            className={styles.approveButton}
            onClick={handleApproveClick}
            disabled={isApprovingDocument}
          >
            {isApprovingDocument ? 'Aprobando...' : 'Aprobar Documento'}
          </button>
        </div>
      </nav>

      {/* Modal de confirmación */}
      <div className={`${styles.modalOverlay} ${showModal ? styles.active : ''}`}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>Confirmar aprobación</div>
            <div className={styles.modalSubtitle}>
              ¿Está seguro de que desea aprobar este documento?
            </div>
          </div>

          <div className={styles.modalContent}>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.total}`}>
                <div className={styles.statLabel}>Total observaciones</div>
                <div className={styles.statValue}>{estadisticasCorrecciones.total}</div>
              </div>
              <div className={`${styles.statCard} ${styles.aprobadas}`}>
                <div className={styles.statLabel}>Corregidas</div>
                <div className={styles.statValue}>{estadisticasCorrecciones.aprobadas}</div>
              </div>
              <div className={`${styles.statCard} ${styles.rechazadas}`}>
                <div className={styles.statLabel}>Sin corregir</div>
                <div className={styles.statValue}>{estadisticasCorrecciones.rechazadas}</div>
              </div>
              <div className={`${styles.statCard} ${styles.pendientes}`}>
                <div className={styles.statLabel}>Pendientes</div>
                <div className={styles.statValue}>{estadisticasCorrecciones.pendientes}</div>
              </div>
            </div>

            {mostrarAdvertencia && (
              <div className={styles.modalWarning}>
                ⚠️ Hay {observacionesSinResolver} observaciones sin resolver. Se recomienda revisarlas antes de aprobar.
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button 
              className={`${styles.modalButton} ${styles.cancel}`}
              onClick={handleCancelApprove}
              disabled={isApprovingDocument}
            >
              Cancelar
            </button>
            <button 
              className={`${styles.modalButton} ${styles.confirm}`}
              onClick={handleConfirmApprove}
              disabled={isApprovingDocument}
            >
              {isApprovingDocument ? 'Aprobando...' : 'Aprobar Documento'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}