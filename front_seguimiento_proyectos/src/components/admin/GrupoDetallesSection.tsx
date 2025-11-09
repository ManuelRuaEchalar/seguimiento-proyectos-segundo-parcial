"use client";

import React, { useState, useEffect } from 'react';
import { Group } from '@/types';
import { getDocentes, getGroups, assignDocenteToGroup, removeDocenteFromGroup, removeEstudianteFromGroup } from '@/services/api';
import '@/styles/admin/section.css';

interface Props {
  group: Group;
  onBack: () => void;
  refreshGroups?: () => Promise<void>;
  setError?: (msg: string) => void;
}

export default function GrupoDetallesSection({ group, onBack, refreshGroups, setError }: Props) {
  const [localGroup, setLocalGroup] = useState<Group>(group);
  useEffect(() => setLocalGroup(group), [group]);

  const docente = (localGroup as any).docente?.usuario as any;
  const estudiantes = (localGroup as any).estudiantes || [] as any[];
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
      const updated = await removeDocenteFromGroup(localGroup.id);
      // Try to obtain a fully populated group (with docente.usuario and estudiantes)
      try {
        const groups = await getGroups();
        const full = (groups || []).find((g: any) => g.id === localGroup.id);
        if (full) setLocalGroup(full);
        else if (updated) setLocalGroup(updated);
      } catch {
        if (updated) setLocalGroup(updated);
      }
      if (refreshGroups) await refreshGroups();
    } catch (err) {
      setError?.(err instanceof Error ? err.message : 'Error al quitar asesor');
    }
  };

  // Open confirm modal for removing estudiante
  const removeEstudiante = (estId: number) => {
    setRemoveEstudianteId(estId);
  };

  const doRemoveEstudiante = async () => {
    const estId = removeEstudianteId;
    setRemoveEstudianteId(null);
    if (estId === null) return;
    try {
      const updated = await removeEstudianteFromGroup(localGroup.id, estId);
      try {
        const groups = await getGroups();
        const full = (groups || []).find((g: any) => g.id === localGroup.id);
        if (full) setLocalGroup(full);
        else if (updated) setLocalGroup(updated);
      } catch {
        if (updated) setLocalGroup(updated);
      }
      if (refreshGroups) await refreshGroups();
    } catch (err) {
      setError?.(err instanceof Error ? err.message : 'Error al eliminar estudiante');
    }
  };

  // Assign docente UI
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [docentesList, setDocentesList] = useState<any[]>([]);
  const [selectedDocenteId, setSelectedDocenteId] = useState<number | null>(null);

  useEffect(() => {
    if (showAssignModal) {
      (async () => {
        try {
          const d = await getDocentes();
          setDocentesList(d || []);
        } catch (err) {
          setError?.(err instanceof Error ? err.message : 'Error al cargar docentes');
        }
      })();
    }
  }, [showAssignModal]);

  const doAssignDocente = async () => {
    if (!selectedDocenteId) return setError?.('Selecciona un docente');
    try {
      const updated = await assignDocenteToGroup(localGroup.id, selectedDocenteId);
      // After assigning, try to get the fully populated group to show docente.usuario
      try {
        const groups = await getGroups();
        const full = (groups || []).find((g: any) => g.id === localGroup.id);
        if (full) setLocalGroup(full);
        else if (updated) setLocalGroup(updated);
      } catch {
        if (updated) setLocalGroup(updated);
      }
      setSelectedDocenteId(null);
      setShowAssignModal(false);
      if (refreshGroups) await refreshGroups();
    } catch (err) {
      setError?.(err instanceof Error ? err.message : 'Error al asignar docente');
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
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{(localGroup as any).nombre}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {(localGroup as any).grado && <span className="group-badge">{(localGroup as any).grado}</span>}
              <span className={`group-badge ${(((localGroup as any).activo) === false) ? 'badge-inactive' : 'badge-active'}`}>{(((localGroup as any).activo) === false) ? 'Inactivo' : 'Activo'}</span>
              {(localGroup as any).createdAt && <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date((localGroup as any).createdAt).toLocaleDateString()}</div>}
              <div style={{ background: '#eef2f7', borderRadius: 999, padding: '0.25rem 0.6rem', fontWeight: 600 }}>{(((localGroup as any).estudiantes?.length) || 0)}</div>
            </div>
          </div>
        </div>

        {/* removed global assign button; assign control appears in Asesor block */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>Sin asignar</div>
              <div>
                <button className="section__button" onClick={() => { setSelectedDocenteId(null); setShowAssignModal(true); }}>Asignar asesor</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign modal */}
      {showAssignModal && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3>Asignar asesor</h3>
            <div style={{ marginBottom: 8 }}>
              <select
                value={selectedDocenteId ?? ''}
                onChange={(e) => setSelectedDocenteId(e.target.value ? Number(e.target.value) : null)}
                className="section-form__input"
              >
                <option value="">Seleccionar docente</option>
                {docentesList.map((d: any) => (
                  <option key={d.id} value={d.id}>{(d.usuario?.nombre || d.nombre) + ' ' + (d.usuario?.apellido || d.apellido)}</option>
                ))}
              </select>
            </div>
            <div className="section__modal-actions">
              <button onClick={doAssignDocente} className="section__button">Asignar</button>
              <button onClick={() => setShowAssignModal(false)} className="section__button section__button--cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}

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
