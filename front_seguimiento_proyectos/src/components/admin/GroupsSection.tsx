'use client';

import { useState } from 'react';
import { Group } from '@/types';
import { createGroup, deleteGroup } from '@/services/api';
import '@/styles/admin/groups-section.css';

interface GroupsSectionProps {
  groups: Group[];
  refreshGroups: () => Promise<void>;
  setError: (error: string) => void;
}

export default function GroupsSection({ groups, refreshGroups, setError }: GroupsSectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', grado: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await createGroup(form);
      setForm({ nombre: '', grado: '' });
      setShowCreateForm(false);
      await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    try {
      setError('');
      await deleteGroup(groupId);
      setShowDeleteConfirm(null);
      await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="groups-section">
      <h2 className="groups-section__title">Grupos</h2>

      <div className="groups-section__create-toggle">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="groups-section__button"
        >
          {showCreateForm ? 'Cerrar Formulario' : 'Crear Grupo'}
        </button>
      </div>

      {showCreateForm && (
        <div className="groups-section__form-wrapper">
          <h3 className="groups-section__form-title">Crear Grupo</h3>
          <form onSubmit={handleSubmit} className="groups-section__form">
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="groups-section__input"
            />
            <select
              value={form.grado}
              onChange={(e) => setForm({ ...form, grado: e.target.value })}
              className="groups-section__input"
              required
            >
              <option value="">Seleccionar Grado</option>
              <option value="grado1">Grado 1</option>
              <option value="grado2">Grado 2</option>
            </select>
            <div className="groups-section__form-actions">
              <button type="submit" className="groups-section__button">Crear Grupo</button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)} 
                className="groups-section__button groups-section__button--cancel"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
{showDeleteConfirm !== null && (
  <div className="groups-section__modal">
    <div className="groups-section__modal-content">
      <h3>Confirmar Eliminación</h3>
      <p>¿Estás seguro de que deseas eliminar este grupo (ID: {showDeleteConfirm})?</p>
      <div className="groups-section__modal-actions">
        <button 
          onClick={() => handleDeleteGroup(showDeleteConfirm)} 
          className="groups-section__button--danger groups-section__button"
        >
          Eliminar
        </button>
        <button 
          onClick={() => setShowDeleteConfirm(null)} 
          className="groups-section__button--cancel groups-section__button"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}


      <h3 className="groups-section__list-title">Lista de Grupos</h3>
      <table className="groups-section__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Grado</th>
            <th>Docente</th>
            <th>Estudiantes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const estudiantesNombres = group.estudiantes?.map((est: any) => `${est.usuario.nombre || ''} ${est.usuario.apellido || ''}`.trim()).join(', ') || 'Sin estudiantes';
            const docenteTexto = group.docente && group.docente.usuario
              ? `${group.docente.usuario.nombre || ''} ${group.docente.usuario.apellido || ''}`.trim()
              : 'Sin asignar';
            return (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>{group.nombre}</td>
                <td>{group.grado}</td>
                <td>{docenteTexto}</td>
                <td>{estudiantesNombres}</td>
                <td>
                   <button onClick={() => setShowDeleteConfirm(group.id)} className="groups-section__button groups-section__button--danger">Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
