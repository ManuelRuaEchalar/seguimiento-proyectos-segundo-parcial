'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Group } from '@/types';
import { assignEstudianteToGroup, createUser, updateUser, deleteUser } from '@/services/api';
import '@/styles/admin/section.css';

interface EstudiantesSectionProps {
  estudiantes: any[];
  groups: Group[];
  setError: (error: string) => void;
  refreshEstudiantes?: () => Promise<void>;
  refreshGroups?: () => Promise<void>;
}

export default function EstudiantesSection({ estudiantes, groups, setError, refreshEstudiantes, refreshGroups }: EstudiantesSectionProps) {
  const [query, setQuery] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeEstudiante, setActiveEstudiante] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'estudiante',
    cu: '',
    carrera: '',
  });

  useEffect(() => {
    if (!showModal) {
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '' });
      setActiveEstudiante(null);
      setModalMode('create');
    }
  }, [showModal]);

  const toggleMenu = (id: number) => {
    setMenuOpenFor((prev) => (prev === id ? null : id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter((s) => {
      const nombre = `${s.usuario?.nombre || ''} ${s.usuario?.apellido || ''}`.toLowerCase();
      return nombre.includes(q) || String(s.id) === q;
    });
  }, [query, estudiantes]);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setError('');
      await createUser({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        rol: 'estudiante',
        cu: form.cu,
        carrera: form.carrera,
      });
      setShowModal(false);
      if (typeof refreshEstudiantes === 'function') await refreshEstudiantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '' });
    setShowModal(true);
  };

  const openEditModal = (estudiante: any) => {
    setModalMode('edit');
    setActiveEstudiante(estudiante);
    setForm({
      nombre: estudiante.usuario?.nombre || '',
      apellido: estudiante.usuario?.apellido || '',
      email: estudiante.usuario?.email || '',
      password: '',
      rol: 'estudiante',
      cu: estudiante.cu || '',
      carrera: estudiante.carrera || '',
    });
    setShowModal(true);
  };

  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeEstudiante) return;
    try {
      setError('');
      const userId = activeEstudiante.usuario?.id ?? activeEstudiante.id;
      await updateUser(userId, {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
        cu: form.cu,
        carrera: form.carrera,
      });
      setShowModal(false);
      if (typeof refreshEstudiantes === 'function') await refreshEstudiantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      setError('');
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      if (typeof refreshEstudiantes === 'function') await refreshEstudiantes();
      if (typeof refreshGroups === 'function') await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleAssign = async (groupId: number, estudianteId: number) => {
    try {
      setError('');
      await assignEstudianteToGroup(groupId, estudianteId);
      if (typeof refreshEstudiantes === 'function') await refreshEstudiantes();
      if (typeof refreshGroups === 'function') await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Estudiantes</h2>
        <div className="section__controls">
          <div className="section__search">
            <input placeholder="Buscar estudiante" value={query} onChange={(e) => setQuery(e.target.value)} className="section__search-input" />
          </div>
          <button className="section__add-button" onClick={openCreateModal}>
            <Image src="/estudiantes.svg" alt="Añadir estudiante" width={16} height={16} />
            <span>Añadir estudiante</span>
          </button>
        </div>
      </div>

      <div className="section__table-wrapper" style={{ overflow: 'visible', paddingBottom: '1.5rem' }}>
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>CU</th>
              <th>Carrera</th>
              <th>Grupo Actual</th>
              <th>Asignar grupo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((estudiante: any) => (
              <tr key={estudiante.id}>
                <td>{estudiante.id}</td>
                <td>{estudiante.usuario?.nombre} {estudiante.usuario?.apellido}</td>
                <td>{estudiante.cu}</td>
                <td>{estudiante.carrera}</td>
                <td>{estudiante.grupo ? estudiante.grupo.nombre : 'No asignado'}</td>
                <td>
                  <select
                    defaultValue=""
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      await handleAssign(+e.target.value, estudiante.id);
                    }}
                    className="section-form__input section__assign-select"
                  >
                    <option value="">Seleccionar Grupo</option>
                    {groups.map((group: Group) => (
                      <option key={group.id} value={group.id}>{group.nombre}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="action-menu">
                    <button className="action-menu-button" onClick={() => toggleMenu(estudiante.id)}>
                      <Image src="/menu.svg" alt="menu" width={20} height={20} />
                    </button>
                    {menuOpenFor === estudiante.id && (
                      <ul className="action-menu-list">
                        <li>
                          <button
                            onClick={() => {
                              toggleMenu(estudiante.id);
                              openEditModal(estudiante);
                            }}
                            className="action-menu-item"
                          >
                            Editar
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              toggleMenu(estudiante.id);
                              const userId = estudiante.usuario?.id ?? estudiante.id;
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

      {showModal && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3 className="section__modal-title">
              {modalMode === 'create' ? 'Añadir estudiante' : `Editar estudiante (ID: ${activeEstudiante?.id ?? ''})`}
            </h3>

            <form onSubmit={modalMode === 'create' ? handleCreate : handleEdit} className="section-form">
              <div className="section-form__row">
                <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="section-form__input" required />
                <input type="text" placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="section-form__input" required />
              </div>
              <div className="section-form__row">
                <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="section-form__input" required />
                <input type="text" placeholder="CU" value={form.cu} onChange={(e) => setForm({ ...form, cu: e.target.value })} className="section-form__input" />
              </div>
              <div className="section-form__row">
                <select value={form.carrera} onChange={(e) => setForm({ ...form, carrera: e.target.value })} className="section-form__input">
                  <option value="">Selecciona una carrera</option>
                  <option value="Ingeniería en Ciencias de la Computación">Ingeniería en Ciencias de la Computación</option>
                  <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                  <option value="Diseño y Animación Digital">Diseño y Animación Digital</option>
                </select>
              </div>
              <div className="section-form__row">
                <input type="password" placeholder="Contraseña (opcional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="section-form__input" />
              </div>
              <div className="section__modal-actions">
                <button type="submit" className="section__button">{modalMode === 'create' ? 'Crear estudiante' : 'Guardar cambios'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="section__button section__button--cancel">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm !== null && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este estudiante (ID: {showDeleteConfirm})?</p>
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
