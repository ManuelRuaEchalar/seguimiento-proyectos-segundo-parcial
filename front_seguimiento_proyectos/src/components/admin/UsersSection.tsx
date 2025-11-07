"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { User } from "@/types";
import { createUser, updateUser, deleteUser } from "@/services/api";
import "@/styles/admin/section.css";

const CARRERAS = [
  "Ingeniería en Ciencias de la Computación",
  "Ingeniería de Sistemas",
  "Diseño y Animación Digital",
];

interface SectionProps {
  users: User[];
  refreshUsers: () => Promise<void>;
  refreshDocentes?: () => Promise<void>;
  refreshEstudiantes?: () => Promise<void>;
  setError: (error: string) => void;
  docentesCount?: number;
  estudiantesCount?: number;
  groupsCount?: number;
  proyectosCount?: number;
}

export default function Section({
  users,
  refreshUsers,
  refreshDocentes,
  refreshEstudiantes,
  setError,
  docentesCount,
  estudiantesCount,
  groupsCount,
  proyectosCount,
}: SectionProps) {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "estudiante",
    cu: "",
    carrera: "",
    especialidad: "",
  });

  useEffect(() => {
    if (!showModal) {
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "estudiante",
        cu: "",
        carrera: "",
        especialidad: "",
      });
      setActiveUser(null);
    }
  }, [showModal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        `${u.nombre || ""} ${u.apellido || ""}`.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        String(u.id) === q
    );
  }, [query, users]);

  const openCreateModal = () => {
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setActiveUser(user);
    setForm({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      email: user.email || "",
      password: "",
      rol: user.rol || "estudiante",
      cu: user.estudiante?.cu || "",
      carrera: user.estudiante?.carrera || "",
      especialidad: user.docente?.especialidad || "",
    });
    setShowModal(true);
  };

  const toggleMenu = (id: number) => {
    setMenuOpenFor((prev) => (prev === id ? null : id));
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setError("");
      const createdRole = form.rol;
      await createUser({
        ...form,
        ...(form.rol === "estudiante" ? { cu: form.cu, carrera: form.carrera } : {}),
        ...(form.rol === "docente" ? { especialidad: form.especialidad } : {}),
      });
      setShowModal(false);
      await refreshUsers();
      if (createdRole === "docente" && typeof refreshDocentes === "function") await refreshDocentes();
      if (createdRole === "estudiante" && typeof refreshEstudiantes === "function") await refreshEstudiantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeUser) return;
    try {
      setError("");
      await updateUser(activeUser.id, {
        ...form,
        ...(form.rol === "estudiante" ? { cu: form.cu, carrera: form.carrera } : {}),
        ...(form.rol === "docente" ? { especialidad: form.especialidad } : {}),
        ...(form.password ? { password: form.password } : {}),
      });
      setShowModal(false);
      await refreshUsers();
      if (typeof refreshDocentes === "function") await refreshDocentes();
      if (typeof refreshEstudiantes === "function") await refreshEstudiantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      setError("");
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      await refreshUsers();
      if (typeof refreshDocentes === "function") await refreshDocentes();
      if (typeof refreshEstudiantes === "function") await refreshEstudiantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="section">
      {/* KPI Row */}
      <div className="section__kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon">
            <Image src="/estudiantes.svg" alt="Estudiantes" width={28} height={28} />
          </div>
          <div>
            <div className="kpi-title">Estudiantes</div>
            <div className="kpi-value">
              {typeof estudiantesCount === "number" ? estudiantesCount : users.filter((u) => u.rol === "estudiante").length}
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">
            <Image src="/docentes.svg" alt="Docentes" width={28} height={28} />
          </div>
          <div>
            <div className="kpi-title">Docentes</div>
            <div className="kpi-value">
              {typeof docentesCount === "number" ? docentesCount : users.filter((u) => u.rol === "docente").length}
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">
            <Image src="/grupos.svg" alt="Grupos" width={28} height={28} />
          </div>
          <div>
            <div className="kpi-title">Grupos</div>
            <div className="kpi-value">{typeof groupsCount === "number" ? groupsCount : "—"}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">
            <Image src="/usuarios.svg" alt="Proyectos" width={28} height={28} />
          </div>
          <div>
            <div className="kpi-title">Proyectos activos</div>
            <div className="kpi-value">{typeof proyectosCount === "number" ? proyectosCount : "—"}</div>
          </div>
        </div>
      </div>

      <div className="section__header">
        <h2 className="section__title">Gestor de usuarios</h2>
        <div className="section__controls">
          <div className="section__search">
            <input
              placeholder="Buscar usuario"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="section__search-input"
            />
          </div>
          <button className="section__add-button" onClick={openCreateModal}>
            <Image src="/usuarios.svg" alt="Añadir" width={16} height={16} />
            <span>Añadir usuario</span>
          </button>
        </div>
      </div>

  <div className="section__table-wrapper" style={{ overflow: 'visible' }}>
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {user.nombre} {user.apellido}
                </td>
                <td>{user.email}</td>
                <td>{user.rol}</td>
                <td>{(user as any).estado ?? "Activo"}</td>
                <td>
                  <div className="action-menu">
                    <button className="action-menu-button" onClick={() => toggleMenu(user.id)}>
                      <Image src="/menu.svg" alt="menu" width={20} height={20} />
                    </button>
                    {menuOpenFor === user.id && (
                      <ul className="action-menu-list" style={{ zIndex: 120 }}>
                        <li>
                          <button
                            onClick={() => {
                              toggleMenu(user.id);
                              openEditModal(user);
                            }}
                            className="action-menu-item"
                          >
                            Editar
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              toggleMenu(user.id);
                              setShowDeleteConfirm(user.id);
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

      {/* Modal: Create / Edit */}
      {showModal && (
        <div className="section__modal">
          <div className="section__modal-content">
            <h3 className="section__modal-title">
              {modalMode === "create" ? "Añadir usuario" : `Editar usuario (ID: ${activeUser?.id ?? ""})`}
            </h3>
            <form onSubmit={modalMode === "create" ? handleCreate : handleEdit} className="section-form">
              <div className="section-form__row">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="section-form__input"
                  required
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  className="section-form__input"
                  required
                />
              </div>
              <div className="section-form__row">
                <input
                  type="email"
                  placeholder="Correo"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="section-form__input"
                  required
                />
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="section-form__input"
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {/* Password input for editing any role (docente already has its own password field in the docente block) */}
              {modalMode === "edit" && form.rol !== "docente" && (
                <div className="section-form__row">
                  <input
                    type="password"
                    placeholder="Contraseña (dejar vacío para no cambiar)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="section-form__input"
                  />
                </div>
              )}

              {form.rol === "estudiante" && (
                <div className="section-form__row">
                  <input
                    type="text"
                    placeholder="CU"
                    value={form.cu}
                    onChange={(e) => setForm({ ...form, cu: e.target.value })}
                    className="section-form__input"
                  />
                  <select
                    value={form.carrera}
                    onChange={(e) => setForm({ ...form, carrera: e.target.value })}
                    className="section-form__input"
                  >
                    <option value="">Selecciona una carrera</option>
                    {CARRERAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.rol === "docente" && (
                <div className="section-form__row">
                  <input
                    type="text"
                    placeholder="Especialidad"
                    value={form.especialidad}
                    onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                    className="section-form__input"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="section-form__input"
                  />
                </div>
              )}

              <div className="section__modal-actions">
                <button type="submit" className="section__button">
                  {modalMode === "create" ? "Crear Usuario" : "Guardar Cambios"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="section__button section__button--cancel">
                  Cancelar
                </button>
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
            <p>¿Estás seguro de que deseas eliminar este usuario (ID: {showDeleteConfirm})?</p>
            <div className="section__modal-actions">
              <button onClick={() => handleDelete(showDeleteConfirm)} className="section__button section__button--danger">
                Eliminar
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="section__button section__button--cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}