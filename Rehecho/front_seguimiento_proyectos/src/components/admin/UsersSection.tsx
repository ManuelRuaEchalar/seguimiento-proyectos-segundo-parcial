'use client';

import { useState } from 'react';
import { User } from '@/types';
import { createUser, updateUser, deleteUser } from '@/services/api';
import '@/styles/admin/users-section.css';

interface UsersSectionProps {
  users: User[];
  refreshUsers: () => Promise<void>;
  setError: (error: string) => void;
}

export default function UsersSection({ users, refreshUsers, setError }: UsersSectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await createUser({
        ...form,
        ...(form.rol === 'estudiante' ? { cu: form.cu, carrera: form.carrera } : {}),
        ...(form.rol === 'docente' ? { especialidad: form.especialidad } : {}),
      });
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });
      setShowCreateForm(false);
      await refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleEditClick = (user: User) => {
    setEditUserId(user.id);
    setEditForm({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      password: '',
      rol: user.rol || 'estudiante',
      cu: user.estudiante?.cu || '',
      carrera: user.estudiante?.carrera || '',
      especialidad: user.docente?.especialidad || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await updateUser(editUserId!, {
        ...editForm,
        ...(editForm.rol === 'estudiante' ? { cu: editForm.cu, carrera: editForm.carrera } : {}),
        ...(editForm.rol === 'docente' ? { especialidad: editForm.especialidad } : {}),
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      setEditUserId(null);
      setEditForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });
      await refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });
  };

  const handleDelete = async (userId: number) => {
    try {
      setError('');
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      await refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

return (
  
  <div className="users-section">
    <h2 className="users-section__title">Usuarios</h2>

    <div className="users-section__create-toggle">
      <button 
        onClick={() => setShowCreateForm(!showCreateForm)} 
        className="users-section__button"
      >
        {showCreateForm ? 'Cerrar Formulario' : 'Crear Usuario'}
      </button>
    </div>

    {showCreateForm && (
      <div className="users-section__form-wrapper">
        <h3 className="users-section__form-title">Crear Usuario</h3>
        <form onSubmit={handleCreateSubmit} className="users-form">
          <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" />
          <input type="text" placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="input-field" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
          <input type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="input-field">
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="admin">Admin</option>
          </select>
          {form.rol === 'estudiante' && (
            <>
              <input type="text" placeholder="CU" value={form.cu} onChange={(e) => setForm({ ...form, cu: e.target.value })} className="input-field" />
              <input type="text" placeholder="Carrera" value={form.carrera} onChange={(e) => setForm({ ...form, carrera: e.target.value })} className="input-field" />
            </>
          )}
          {form.rol === 'docente' && (
            <input type="text" placeholder="Especialidad" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} className="input-field" />
          )}
          <div className="users-section__form-actions">
            <button type="submit" className="users-section__button">Crear Usuario</button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="users-section__button users-section__button--cancel">Cancelar</button>
          </div>
        </form>
      </div>
    )}

    {editUserId !== null && (
      <div className="users-section__form-wrapper">
        <h3 className="users-section__form-title">Editar Usuario (ID: {editUserId})</h3>
        <form onSubmit={handleEditSubmit} className="users-form">
          <input type="text" placeholder="Nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} className="input-field" />
          <input type="text" placeholder="Apellido" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} className="input-field" />
          <input type="email" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" />
          <input type="password" placeholder="Nueva Contraseña (opcional)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="input-field" />
          <select value={editForm.rol} onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })} className="input-field">
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="admin">Admin</option>
          </select>
          {editForm.rol === 'estudiante' && (
            <>
              <input type="text" placeholder="CU" value={editForm.cu} onChange={(e) => setEditForm({ ...editForm, cu: e.target.value })} className="input-field" />
              <input type="text" placeholder="Carrera" value={editForm.carrera} onChange={(e) => setEditForm({ ...editForm, carrera: e.target.value })} className="input-field" />
            </>
          )}
          {editForm.rol === 'docente' && (
            <input type="text" placeholder="Especialidad" value={editForm.especialidad} onChange={(e) => setEditForm({ ...editForm, especialidad: e.target.value })} className="input-field" />
          )}
          <div className="users-section__form-actions">
            <button type="submit" className="users-section__button">Guardar Cambios</button>
            <button type="button" onClick={handleCancelEdit} className="users-section__button users-section__button--cancel">Cancelar</button>
          </div>
        </form>
      </div>
    )}

    {showDeleteConfirm !== null && (
      <div className="users-section__modal">
        <div className="users-section__modal-content">
          <h3>Confirmar Eliminación</h3>
          <p>¿Estás seguro de que deseas eliminar este usuario (ID: {showDeleteConfirm})?</p>
          <div className="users-section__modal-actions">
            <button onClick={() => handleDelete(showDeleteConfirm)} className="users-section__button--danger users-section__button">Eliminar</button>
            <button onClick={() => setShowDeleteConfirm(null)} className="users-section__button--cancel users-section__button">Cancelar</button>
          </div>
        </div>
      </div>
    )}

    <h3 className="users-section__list-title">Lista de Usuarios</h3>
    <table className="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.nombre} {user.apellido}</td>
            <td>{user.email}</td>
            <td>{user.rol}</td>
            <td>
              <button onClick={() => handleEditClick(user)} className="users-section__button">Editar</button>
              <button onClick={() => setShowDeleteConfirm(user.id)} className="users-section__button users-section__button--danger">Eliminar</button>
              
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}