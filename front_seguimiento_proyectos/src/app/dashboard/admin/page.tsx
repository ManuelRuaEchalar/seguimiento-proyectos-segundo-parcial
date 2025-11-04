'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, getGroups, getDocentes, logout, getEstudiantes } from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '../../../hooks/userAuthGuard';
import UsersSection from '../../../components/admin/UsersSection';
import EstudiantesSection from '../../../components/admin/EstudiantesSection';
import DocentesSection from '../../../components/admin/DocentesSection';
import GroupsSection from '../../../components/admin/GroupsSection';

import '../../..//styles/admin/admin.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
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
      } else if (activeSection === 'estudiantes') {
        const data = await getEstudiantes();
        setEstudiantes(data);
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
    return <p className="text-center text-gray-500">Cargando...</p>;
  }

  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">Usuario no autorizado 🚫</h1>
        <p className="text-gray-600">No tienes permiso para acceder a este panel.</p>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );
  }

  return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="sidebar w-64 bg-gray-100 text-gray-800 p-6 fixed h-full flex flex-col justify-between shadow-md">
          {/* Bienvenida */}
          <div>
            <p className="text-base font-bold mb-6 text-f6f9ff">
              BIENVENIDO {user?.email} ({user?.rol})
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <button
                  className={`w-full text-left py-2 px-4 rounded-md font-medium ${
                    activeSection === 'users'
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSection('users')}
                >
                  Usuarios
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left py-2 px-4 rounded-md font-medium ${
                    activeSection === 'estudiantes'
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSection('estudiantes')}
                >
                  Estudiantes
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left py-2 px-4 rounded-md font-medium ${
                    activeSection === 'docentes'
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSection('docentes')}
                >
                  Docentes
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left py-2 px-4 rounded-md font-medium ${
                    activeSection === 'groups'
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSection('groups')}
                >
                  Grupos
                </button>
              </li>
            </ul>
          </div>

          {/* Logout */}
          <button className="logout"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
  
      {/* Main Content */}
      <div className="ml-64 p-6 w-full bg-white min-h-screen text-gray-800">
        <h1 className="text-3xl text-1e396c font-bold mb-6">Panel de Administración</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}
        {activeSection === 'users' && (
          <UsersSection
            users={users}
            refreshUsers={fetchData}
            setError={setFetchError}
          />
        )}
        {activeSection === 'estudiantes' && (
          <EstudiantesSection
            estudiantes={estudiantes}
            groups={groups}
            setError={setFetchError}
          />
        )}
        {activeSection === 'docentes' && (
          <DocentesSection
            docentes={docentes}
            groups={groups}
            setError={setFetchError}
          />
        )}
        {activeSection === 'groups' && (
          <GroupsSection
            groups={groups}
            refreshGroups={fetchData}
            setError={setFetchError}
          />
        )}
      </div>
    </div>
  );
}