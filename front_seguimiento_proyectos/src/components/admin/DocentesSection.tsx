'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Group } from '@/types';
import { assignDocenteToGroup, createUser, updateUser, deleteUser } from '@/services/api';
import '@/styles/admin/section.css';

interface DocentesSectionProps {
  docentes: any[];
  groups: Group[];
  setError: (error: string) => void;
  refreshDocentes?: () => Promise<void>;
  refreshGroups?: () => Promise<void>;
}

export default function DocentesSection({ docentes, groups, setError, refreshDocentes, refreshGroups }: DocentesSectionProps) {
  const [query, setQuery] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeDocente, setActiveDocente] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'docente',
    especialidad: '',
  });

  useEffect(() => {
    if (!showModal) {
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'docente', especialidad: '' });
      setActiveDocente(null);
      setModalMode('create');
    }
  }, [showModal]);

  const toggleMenu = (id: number) => {
    setMenuOpenFor((prev) => (prev === id ? null : id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docentes;
    return docentes.filter((d) => {
      const nombre = `${d.usuario?.nombre || ''} ${d.usuario?.apellido || ''}`.toLowerCase();
      return nombre.includes(q) || String(d.id) === q;
    });
  }, [query, docentes]);

  // Create docente (creates a user with role 'docente')
  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setError('');
      await createUser({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        rol: 'docente',
        especialidad: form.especialidad,
      });
      setShowModal(false);
      if (typeof refreshDocentes === 'function') await refreshDocentes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'docente', especialidad: '' });
    setShowModal(true);
  };

  const openEditModal = (docente: any) => {
    setModalMode('edit');
    setActiveDocente(docente);
    setForm({
      nombre: docente.usuario?.nombre || '',
      apellido: docente.usuario?.apellido || '',
      email: docente.usuario?.email || '',
      password: '',
      rol: 'docente',
      especialidad: docente.especialidad || '',
    });
    setShowModal(true);
  };

  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeDocente) return;
    try {
      setError('');
      const userId = activeDocente.usuario?.id ?? activeDocente.id;
      await updateUser(userId, {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        especialidad: form.especialidad,
        ...(form.password ? { password: form.password } : {}),
      });
      setShowModal(false);
      if (typeof refreshDocentes === 'function') await refreshDocentes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      setError('');
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      if (typeof refreshDocentes === 'function') await refreshDocentes();
      if (typeof refreshGroups === 'function') await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // assign via inline select (no modal)

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Docentes</h2>
        <div className="section__controls">
          <div className="section__search">
            <input placeholder="Buscar docente" value={query} onChange={(e) => setQuery(e.target.value)} className="section__search-input" />
          </div>
          <button className="section__add-button" onClick={openCreateModal}>
            <Image src="/docentes.svg" alt="Añadir docente" width={16} height={16} />
            <span>Añadir docente</span>
          </button>
        </div>
      </div>

      <div className="section__table-wrapper" style={{ overflow: 'visible', paddingBottom: '1.5rem' }}>
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre completo</th>
              <th>Especialidad</th>
              <th>Estado</th>
              <th>Grupos</th>
              <th>Asignar grupo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((docente: any) => (
              <tr key={docente.id}>
                <td>{docente.id}</td>
                <td>{docente.usuario?.nombre} {docente.usuario?.apellido}</td>
                <td>{docente.especialidad}</td>
                <td>{(docente as any).estado ?? 'Activo'}</td>
                <td>
                  {docente.grupos?.length ? docente.grupos.map((g: any) => (
                    <span key={g.id} style={{ marginRight: 6, display: 'inline-block', background: 'var(--color-muted)', padding: '4px 8px', borderRadius: 999, fontSize: 12 }}>
                      {g.nombre}
                    </span>
                  )) : 'Sin grupo'}
                </td>
                <td>
                  <select
                    defaultValue=""
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      const groupId = +e.target.value;
                      try {
                        setError('');
                        await assignDocenteToGroup(groupId, docente.id);
                        if (typeof refreshDocentes === 'function') await refreshDocentes();
                        if (typeof refreshGroups === 'function') await refreshGroups();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : String(err));
                      }
                    }}
                    className="section-form__input section__assign-select"
                  >
                    <option value="">Seleccionar Grupo</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="action-menu">
                    <button className="action-menu-button" onClick={() => toggleMenu(docente.id)}>
                      <Image src="/menu.svg" alt="menu" width={20} height={20} />
                    </button>
                    {menuOpenFor === docente.id && (
                      <ul className="action-menu-list">
                        <li>
                          <button
                            onClick={() => {
                              toggleMenu(docente.id);
                              openEditModal(docente);
                            }}
                            className="action-menu-item"
                          >
                            Editar
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              toggleMenu(docente.id);
                              const userId = docente.usuario?.id ?? docente.id;
                              setShowDeleteConfirm(userId);
                            }}
                            className="action-menu-item action-menu-item--danger"
                          >
                            Eliminar
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Create / Edit / Assign */}
      {showModal && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3 className="section__modal-title">
              {modalMode === 'create' ? 'Añadir docente' : `Editar docente (ID: ${activeDocente?.id ?? ''})`}
            </h3>

            <form onSubmit={modalMode === 'create' ? handleCreate : handleEdit} className="section-form">
              <div className="section-form__row">
                <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="section-form__input" required />
                <input type="text" placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="section-form__input" required />
              </div>
              <div className="section-form__row">
                <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="section-form__input" required />
                <input type="text" placeholder="Especialidad" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} className="section-form__input" />
              </div>
              <div className="section-form__row">
                <input type="password" placeholder="Contraseña (opcional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="section-form__input" />
              </div>
              <div className="section__modal-actions">
                <button type="submit" className="section__button">{modalMode === 'create' ? 'Crear docente' : 'Guardar cambios'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="section__button section__button--cancel">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm !== null && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este docente (ID: {showDeleteConfirm})?</p>
            <div className="section__modal-actions">
              <button onClick={() => handleDelete(showDeleteConfirm)} className="section__button section__button--danger">Eliminar</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="section__button section__button--cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
