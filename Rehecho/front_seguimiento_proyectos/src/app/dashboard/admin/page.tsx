'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, getGroups, getDocentes, createUser, updateUser, deleteUser, createGroup, deleteGroup, assignDocenteToGroup, assignEstudianteToGroup, logout } from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('users');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeSection]);

  async function fetchData() {
    try {
      setFetchError('');
      if (activeSection === 'users') {
        const data = await getUsers();
        setUsers(data);
      } else if (activeSection === 'groups') {
        const data = await getGroups();
        setGroups(data);
      } else if (activeSection === 'docentes') {
        const data = await getDocentes();
        setDocentes(data);
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (isUnauthorized) {
    return (
      <div>
        <h1>Usuario no autorizado 🚫</h1>
        <p>No tienes permiso para acceder a este panel.</p>
        {error && <p>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1>Panel de Administración 🛠️</h1>
        <p>Bienvenido, {user?.email} ({user?.rol})</p>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <div>
        <button onClick={() => setActiveSection('users')}>Usuarios</button>
        <button onClick={() => setActiveSection('estudiantes')}>Estudiantes</button>
        <button onClick={() => setActiveSection('docentes')}>Docentes</button>
        <button onClick={() => setActiveSection('groups')}>Grupos</button>
      </div>
      {error && <p>{error}</p>}
      {fetchError && <p>{fetchError}</p>}
      {activeSection === 'users' && (
        <UsersSection users={users} onCreate={createUser} onUpdate={updateUser} onDelete={deleteUser} setError={setFetchError} refreshUsers={fetchData} />
      )}
      {activeSection === 'estudiantes' && (
        <EstudiantesSection users={users.filter(u => u.rol === 'estudiante')} groups={groups} onAssign={assignEstudianteToGroup} setError={setFetchError} />
      )}
      {activeSection === 'docentes' && (
        <DocentesSection docentes={docentes} groups={groups} onAssign={assignDocenteToGroup} setError={setFetchError} />
      )}
      {activeSection === 'groups' && (
        <GroupsSection groups={groups} onCreate={createGroup} onDelete={deleteGroup} setError={setFetchError} refreshGroups={fetchData} />
      )}
    </div>
  );
}

function UsersSection({ users, onCreate, onUpdate, onDelete, setError, refreshUsers }: any) {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await onCreate({ ...form, ...(form.rol === 'estudiante' ? { cu: form.cu, carrera: form.carrera } : {}), ...(form.rol === 'docente' ? { especialidad: form.especialidad } : {}) });
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', cu: '', carrera: '', especialidad: '' });
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
      await onUpdate(editUserId, {
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

  return (
    <div>
      <h2>Usuarios</h2>
      <h3>Crear Usuario</h3>
      <form onSubmit={handleCreateSubmit}>
        <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input type="text" placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="admin">Admin</option>
        </select>
        {form.rol === 'estudiante' && (
          <>
            <input type="text" placeholder="CU" value={form.cu} onChange={(e) => setForm({ ...form, cu: e.target.value })} />
            <input type="text" placeholder="Carrera" value={form.carrera} onChange={(e) => setForm({ ...form, carrera: e.target.value })} />
          </>
        )}
        {form.rol === 'docente' && (
          <input type="text" placeholder="Especialidad" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} />
        )}
        <button type="submit">Crear Usuario</button>
      </form>

      {editUserId !== null && (
        <div>
          <h3>Editar Usuario (ID: {editUserId})</h3>
          <form onSubmit={handleEditSubmit}>
            <input type="text" placeholder="Nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
            <input type="text" placeholder="Apellido" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} />
            <input type="email" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input type="password" placeholder="Nueva Contraseña (opcional)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
            <select value={editForm.rol} onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}>
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="admin">Admin</option>
            </select>
            {editForm.rol === 'estudiante' && (
              <>
                <input type="text" placeholder="CU" value={editForm.cu} onChange={(e) => setEditForm({ ...editForm, cu: e.target.value })} />
                <input type="text" placeholder="Carrera" value={editForm.carrera} onChange={(e) => setEditForm({ ...editForm, carrera: e.target.value })} />
              </>
            )}
            {editForm.rol === 'docente' && (
              <input type="text" placeholder="Especialidad" value={editForm.especialidad} onChange={(e) => setEditForm({ ...editForm, especialidad: e.target.value })} />
            )}
            <button type="submit">Guardar Cambios</button>
            <button type="button" onClick={handleCancelEdit}>Cancelar</button>
          </form>
        </div>
      )}

      <h3>Lista de Usuarios</h3>
      <table>
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
          {(() => {
            const rows = [];
            for (const user of users) {
              rows.push(
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nombre} {user.apellido}</td>
                  <td>{user.email}</td>
                  <td>{user.rol}</td>
                  <td>
                    <button onClick={() => handleEditClick(user)}>Editar</button>
                    <button onClick={() => onDelete(user.id)}>Eliminar</button>
                  </td>
                </tr>
              );
            }
            return rows;
          })()}
        </tbody>
      </table>
    </div>
  );
}

function EstudiantesSection({ users, groups, onAssign, setError }: any) {
  return (
    <div>
      <h2>Estudiantes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>CU</th>
            <th>Carrera</th>
            <th>Asignar Grupo</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: User) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nombre} {user.apellido}</td>
              <td>{user.estudiante?.cu}</td>
              <td>{user.estudiante?.carrera}</td>
              <td>
                <select onChange={async (e) => {
                  try {
                    setError('');
                    const estId = user.estudiante?.id;
                    if (!estId) return;
                    await onAssign(+e.target.value, estId);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                  }
                }}>
                  <option value="">Seleccionar Grupo</option>
                  {groups.map((group: Group) => (
                    <option key={group.id} value={group.id}>{group.nombre}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocentesSection({ docentes, groups, onAssign, setError }: any) {
  return (
    <div>
      <h2>Docentes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Asignar Grupo</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente: any) => (
            <tr key={docente.id}>
              <td>{docente.id}</td>
              <td>{docente.usuario.nombre} {docente.usuario.apellido}</td>
              <td>{docente.especialidad}</td>
              <td>
                <select onChange={async (e) => {
                  try {
                    setError('');
                    await onAssign(+e.target.value, docente.id);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                  }
                }}>
                  <option value="">Seleccionar Grupo</option>
                  {groups.map((group: Group) => (
                    <option key={group.id} value={group.id}>{group.nombre}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupsSection({ groups, onCreate, onDelete, setError, refreshGroups }: any) {
  const [form, setForm] = useState({ nombre: '', grado: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await onCreate(form);
      setForm({ nombre: '', grado: '' });
      await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    try {
      setError('');
      await onDelete(groupId);
      await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <h2>Grupos</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input type="text" placeholder="Grado" value={form.grado} onChange={(e) => setForm({ ...form, grado: e.target.value })} />
        <button type="submit">Crear Grupo</button>
      </form>
      <table>
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
          {(() => {
            const rows = [];
            for (const group of groups) {
              const estudiantesNombres = [];
              if (group.estudiantes && group.estudiantes.length > 0) {
                for (const estudiante of group.estudiantes) {
                  estudiantesNombres.push(`${estudiante.usuario.nombre || ''} ${estudiante.usuario.apellido || ''}`.trim());
                }
              }
              const estudiantesTexto = estudiantesNombres.length > 0 ? estudiantesNombres.join(', ') : 'Sin estudiantes';
              const docenteTexto = group.docente && group.docente.usuario 
                ? `${group.docente.usuario.nombre || ''} ${group.docente.usuario.apellido || ''}`.trim() 
                : 'Sin asignar';
              rows.push(
                <tr key={group.id}>
                  <td>{group.id}</td>
                  <td>{group.nombre}</td>
                  <td>{group.grado}</td>
                  <td>{docenteTexto}</td>
                  <td>{estudiantesTexto}</td>
                  <td>
                    <button onClick={() => handleDeleteGroup(group.id)}>Eliminar</button>
                  </td>
                </tr>
              );
            }
            return rows;
          })()}
        </tbody>
      </table>
    </div>
  );
}