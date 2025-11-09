"use client";

import { useState, useMemo } from 'react';
import { Group } from '@/types';
import { createGroup, deleteGroup, updateGroup } from '@/services/api';
import GrupoDetallesSection from './GrupoDetallesSection';
import '@/styles/admin/groups-section.css';

interface GroupsSectionProps {
  groups: Group[];
  refreshGroups: () => Promise<void>;
  refreshDocentes?: () => Promise<void>;
  refreshEstudiantes?: () => Promise<void>;
  setError: (error: string) => void;
}

export default function GroupsSection({ groups, refreshGroups, refreshDocentes, refreshEstudiantes, setError }: GroupsSectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', grado: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [query, setQuery] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  const toggleMenu = (id: number) => setMenuOpenFor((prev) => (prev === id ? null : id));

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const name = (g.nombre || '').toString().toLowerCase();
      return name.includes(q) || String(g.id) === q;
    });
  }, [groups, query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (modalMode === 'create') {
        await createGroup(form);
      } else if (modalMode === 'edit' && editingGroupId !== null) {
        // Only send provided fields; grado may be empty if user didn't change it
        const payload: any = { nombre: form.nombre };
        if (form.grado) payload.grado = form.grado;
        await updateGroup(editingGroupId, payload);
      }
      setForm({ nombre: '', grado: '' });
      setShowCreateForm(false);
      setModalMode('create');
      setEditingGroupId(null);
      await refreshGroups();
      if (typeof refreshDocentes === 'function') await refreshDocentes();
      if (typeof refreshEstudiantes === 'function') await refreshEstudiantes();
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
      if (typeof refreshDocentes === 'function') await refreshDocentes();
      if (typeof refreshEstudiantes === 'function') await refreshEstudiantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // If a group is selected, show the details section
  if (selectedGroup) {
    return (
      <GrupoDetallesSection
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        refreshGroups={refreshGroups}
        setError={setError}
      />
    );
  }

  return (
    <div className="groups-section">
      <div className="section__header">
        <h2 className="section__title">Grupos</h2>
        <div className="section__controls">
          <div className="section__search">
            <input
              placeholder="Buscar grupo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="section__search-input"
            />
          </div>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setModalMode('create'); }}
            className="section__add-button"
          >
            {showCreateForm ? 'Cerrar Formulario' : 'Añadir grupo'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="groups-section__modal">
          <div className="groups-section__modal-content">
            <h3 className="groups-section__modal-title">{modalMode === 'create' ? 'Crear Grupo' : `Editar Grupo (ID: ${editingGroupId ?? ''})`}</h3>

            <form onSubmit={handleSubmit} className="groups-section__form">
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="groups-section__input"
                required
              />
              <select
                value={form.grado}
                onChange={(e) => setForm({ ...form, grado: e.target.value })}
                className="groups-section__input"
                required={modalMode === 'create'}
              >
                <option value="">Seleccionar Grado</option>
                <option value="grado1">Grado 1</option>
                <option value="grado2">Grado 2</option>
              </select>
              <div className="groups-section__modal-actions" style={{ marginTop: 12 }}>
                <button type="submit" className="groups-section__button">{modalMode === 'create' ? 'Crear Grupo' : 'Guardar cambios'}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setModalMode('create');
                    setEditingGroupId(null);
                    setForm({ nombre: '', grado: '' });
                  }}
                  className="groups-section__button groups-section__button--cancel"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
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
                className="groups-section__button groups-section__button--danger"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="groups-section__button groups-section__button--cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="groups-grid">
        {filteredGroups.map((group) => {
          const estudiantesCount = group.estudiantes?.length || 0;
          const docenteTexto = group.docente && group.docente.usuario
            ? `${group.docente.usuario.nombre || ''} ${group.docente.usuario.apellido || ''}`.trim()
            : 'Sin asignar';
          const activo = (group as any).activo;
          return (
            <div className="group-card" key={group.id}>
              <div className="group-card__header">
                <h4 className="group-card__title">{group.nombre}</h4>
                <div className="group-card__bubble">{group.id}</div>
              </div>
              <p className="group-card__line"><strong>Asesor:</strong> {docenteTexto}</p>
              <p className="group-card__line"><strong>Estudiantes:</strong> {estudiantesCount}</p>
              <div className="group-card__meta">
                <span className="group-card__tag">{group.grado}</span>
                <span className={`group-card__status ${activo === false ? 'inactive' : 'active'}`}>{activo === false ? 'Inactivo' : 'Activo'}</span>
              </div>
              <div className="group-card__actions">
                <button onClick={() => setSelectedGroup(group)} className="group-card__view">Ver Grupo</button>
                <div className="group-card__menu-wrap">
                  <button onClick={() => toggleMenu(group.id)} className="group-card__menu">⋮</button>
                  {menuOpenFor === group.id && (
                    <ul className="group-card__menu-list">
                      <li>
                        <button
                          className="group-card__menu-item"
                          onClick={() => {
                            // prefill and open create form in edit mode (non-destructive UI only)
                            setForm({ nombre: group.nombre, grado: group.grado || '' });
                            setModalMode('edit');
                            setEditingGroupId(group.id);
                            setShowCreateForm(true);
                            setMenuOpenFor(null);
                          }}
                        >Editar</button>
                      </li>
                      <li>
                        <button
                          className="group-card__menu-item group-card__menu-item--danger"
                          onClick={() => { setShowDeleteConfirm(group.id); setMenuOpenFor(null); }}
                        >Eliminar</button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
