'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  getUsers,
  getGroups,
  getDocentes,
  logout,
  getEstudiantes,
} from '@/services/api';
import { User, Group } from '@/types';
import { useAuthGuard } from '@/hooks/userAuthGuard';
import UsersSection from '@/components/admin/UsersSection';
import EstudiantesSection from '@/components/admin/EstudiantesSection';
import DocentesSection from '@/components/admin/DocentesSection';
import GroupsSection from '@/components/admin/GroupsSection';

import '@/styles/admin/admin.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading, isUnauthorized, error } = useAuthGuard('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('users');
  const [fetchError, setFetchError] = useState('');

  // Load all datasets once when user is available and expose individual refreshers
  useEffect(() => {
    if (!user) return;
    (async function loadAll() {
      try {
        setFetchError('');
        const [u, g, d, e] = await Promise.all([
          getUsers(),
          getGroups(),
          getDocentes(),
          getEstudiantes(),
        ]);
        setUsers(u);
        setGroups(g);
        setDocentes(d);
        setEstudiantes(e);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [user]);

  // Individual refresh functions to pass to children
  const refreshUsers = async () => {
    const u = await getUsers();
    setUsers(u);
  };
  const refreshGroups = async () => {
    const g = await getGroups();
    setGroups(g);
  };
  const refreshDocentes = async () => {
    const d = await getDocentes();
    setDocentes(d);
  };
  const refreshEstudiantes = async () => {
    const e = await getEstudiantes();
    setEstudiantes(e);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    }
  };

  // Refresh all datasets (called when switching sections)
  const refreshAll = async () => {
    try {
      setFetchError('');
      await Promise.all([refreshUsers(), refreshGroups(), refreshDocentes(), refreshEstudiantes()]);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleChangeSection = async (section: string) => {
    setActiveSection(section);
    // Always refresh everything when changing section
    await refreshAll();
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
      <aside className="sidebar">
        <div className="sidebarTop">
          <div className="sidebarHeader">
            <Image src="/logo_blanco.svg" alt="logo" width={36} height={36} />
            <h2 className="adminTitle">Admin</h2>
          </div>

          <nav className="navContainer">
            <ul className="sidebarNav">
              <li>
                <button
                  className={`navButton ${activeSection === 'users' ? 'active' : ''}`}
                  onClick={() => void handleChangeSection('users')}
                >
                  <Image src="/usuarios.svg" alt="Usuarios" width={20} height={20} className="navIcon" />
                  <span>Usuarios</span>
                </button>
              </li>
              <li>
                <button
                  className={`navButton ${activeSection === 'groups' ? 'active' : ''}`}
                  onClick={() => void handleChangeSection('groups')}
                >
                  <Image src="/grupos.svg" alt="Grupos" width={20} height={20} className="navIcon" />
                  <span>Grupos</span>
                </button>
              </li>
              <li>
                <button
                  className={`navButton ${activeSection === 'docentes' ? 'active' : ''}`}
                  onClick={() => void handleChangeSection('docentes')}
                >
                  <Image src="/docentes.svg" alt="Docentes" width={20} height={20} className="navIcon" />
                  <span>Docentes</span>
                </button>
              </li>
              <li>
                <button
                  className={`navButton ${activeSection === 'estudiantes' ? 'active' : ''}`}
                  onClick={() => void handleChangeSection('estudiantes')}
                >
                  <Image src="/estudiantes.svg" alt="Estudiantes" width={20} height={20} className="navIcon" />
                  <span>Estudiantes</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <button className="logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
  <main className="ml-64 p-6 w-full min-h-screen text-gray-800" style={{ backgroundColor: 'var(--color-bg)' }}>
        <h1 className="text-3xl font-bold text-[#1e396c] mb-6">Panel de Administración</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}
        {activeSection === 'users' && (
          <UsersSection
            users={users}
            refreshUsers={refreshUsers}
            refreshDocentes={refreshDocentes}
            refreshEstudiantes={refreshEstudiantes}
            setError={setFetchError}
            docentesCount={docentes.length}
            estudiantesCount={estudiantes.length}
            groupsCount={groups.length}
            proyectosCount={0}
          />
        )}
        {activeSection === 'estudiantes' && (
          <EstudiantesSection
            estudiantes={estudiantes}
            groups={groups}
            setError={setFetchError}
            refreshEstudiantes={refreshEstudiantes}
            refreshGroups={refreshGroups}
          />
        )}
        {activeSection === 'docentes' && (
          <DocentesSection
            docentes={docentes}
            groups={groups}
            setError={setFetchError}
            refreshDocentes={refreshDocentes}
            refreshGroups={refreshGroups}
          />
        )}
        {activeSection === 'groups' && (
          <GroupsSection
            groups={groups}
            refreshGroups={refreshGroups}
            refreshDocentes={refreshDocentes}
            refreshEstudiantes={refreshEstudiantes}
            setError={setFetchError}
          />
        )}
      </main>
    </div>
  );
}
