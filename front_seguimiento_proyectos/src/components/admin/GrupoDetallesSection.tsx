"use client";

import React, { useState } from 'react';
import { Group } from '@/types';
import '@/styles/admin/section.css';

interface Props {
  group: Group;
  onBack: () => void;
  refreshGroups?: () => Promise<void>;
  setError?: (msg: string) => void;
}

export default function GrupoDetallesSection({ group, onBack, refreshGroups, setError }: Props) {
  const docente = group.docente?.usuario as any;
  const estudiantes = group.estudiantes || [] as any[];
  const [showRemoveDocenteModal, setShowRemoveDocenteModal] = useState(false);
  const [removeEstudianteId, setRemoveEstudianteId] = useState<number | null>(null);

  // Open confirm modal for removing asesor
  const removeDocente = () => {
    if (!docente) return;
    setShowRemoveDocenteModal(true);
  };

  const doRemoveDocente = async () => {
    setShowRemoveDocenteModal(false);
    try {
      const res = await fetch(`/api/groups/${group.id}/docente`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Endpoint no disponible');
      if (refreshGroups) await refreshGroups();
    } catch {
      if (refreshGroups) await refreshGroups();
      setError?.('Operación simulada: asesor removido (mock).');
    }
  };

  // Open confirm modal for removing estudiante
  const removeEstudiante = (estId: number) => {
    setRemoveEstudianteId(estId);
  };

  const doRemoveEstudiante = async () => {
    const estId = removeEstudianteId;
    setRemoveEstudianteId(null);
    if (!estId) return;
    try {
      const res = await fetch(`/api/groups/${group.id}/estudiantes/${estId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Endpoint no disponible');
      if (refreshGroups) await refreshGroups();
    } catch {
      if (refreshGroups) await refreshGroups();
      setError?.('Operación simulada: estudiante eliminado del grupo (mock).');
    }
  };

  return (
    <div className="section">
      <div className="section__header">
        <div>
          <button className="section__button section__button--cancel" onClick={onBack}>Volver</button>
        </div>
        <div />
      </div>

      {/* Group summary: show metadata at the top */}
      <div className="group-summary" style={{ marginTop: '1rem' }}>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{group.nombre}</div>
              <div style={{ color: '#6b7280', marginTop: 4 }}>ID: {group.id} • {(group as any).descripcion || ''}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {group.grado && <span className="group-badge">{group.grado}</span>}
              <span className={`group-badge ${((group as any).activo === false) ? 'badge-inactive' : 'badge-active'}`}>{((group as any).activo === false) ? 'Inactivo' : 'Activo'}</span>
              {(group as any).createdAt && <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date((group as any).createdAt).toLocaleDateString()}</div>}
              <div style={{ background: '#eef2f7', borderRadius: 999, padding: '0.25rem 0.6rem', fontWeight: 600 }}>{((group as any).estudiantes?.length || 0)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="group-detail-card" style={{ marginTop: '1rem' }}>
        <h3 className="section__title">Asesor</h3>
        <div style={{ padding: '0.75rem', background: '#fff', borderRadius: 8 }}>
          {docente ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{`${docente.nombre || ''} ${docente.apellido || ''}`.trim()}</div>
                {docente.email && <div style={{ color: '#666', fontSize: '0.9rem' }}>{docente.email}</div>}
              </div>
              <div>
                <button className="section__button section__button--danger" onClick={removeDocente}>Quitar asesor</button>
              </div>
            </div>
          ) : (
            <div>Sin asignar</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h3 className="section__title">Estudiantes ({estudiantes.length})</h3>
        <div className="section__table-wrapper">
          <table className="section-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre completo</th>
                <th>CU</th>
                <th>Carrera</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.length === 0 && (
                <tr>
                  <td colSpan={5}>Sin estudiantes</td>
                </tr>
              )}
              {estudiantes.map((est: any) => (
                <tr key={est.id}>
                  <td>{est.id}</td>
                  <td>{`${est.usuario?.nombre || ''} ${est.usuario?.apellido || ''}`.trim()}</td>
                  <td>{est.cu || '-'}</td>
                  <td>{est.carrera || '-'}</td>
                  <td>
                    <button className="section__button section__button--danger" onClick={() => removeEstudiante(est.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm modal for removing docente */}
      {showRemoveDocenteModal && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3>Quitar asesor</h3>
            <p>¿Estás seguro de que deseas quitar el asesor de este grupo?</p>
            <div className="section__modal-actions">
              <button onClick={doRemoveDocente} className="section__button section__button--danger">Quitar</button>
              <button onClick={() => setShowRemoveDocenteModal(false)} className="section__button section__button--cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal for removing estudiante */}
      {removeEstudianteId !== null && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3>Eliminar estudiante</h3>
            <p>¿Estás seguro de que deseas eliminar al estudiante (ID: {removeEstudianteId}) del grupo?</p>
            <div className="section__modal-actions">
              <button onClick={doRemoveEstudiante} className="section__button section__button--danger">Eliminar</button>
              <button onClick={() => setRemoveEstudianteId(null)} className="section__button section__button--cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
