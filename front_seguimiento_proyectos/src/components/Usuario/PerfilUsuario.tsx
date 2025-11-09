"use client";

import React, { useEffect, useState } from "react";
import styles from '@/styles/usuario/perfilusuario.module.css';
import { getUser, getDocenteWithGroups, getEstudianteMe, updateMyProfile } from '@/services/api';

export default function PerfilUsuario() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [docenteInfo, setDocenteInfo] = useState<any | null>(null);
  const [estudianteInfo, setEstudianteInfo] = useState<any | null>(null);

  const [form, setForm] = useState({ nombre: "", apellido: "", email: "" });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-profile', onOpen);
    return () => window.removeEventListener('open-profile', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getUser();
        const u = data.user || data;
        setUser(u);
        setForm({ nombre: u.nombre || '', apellido: u.apellido || '', email: u.email || '' });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setErrorMsg(null);

        if (u.rol === 'docente') {
          try {
            // getDocenteWithGroups returns { docente, groups }
            const info = await getDocenteWithGroups();
            setDocenteInfo(info?.docente || null);
          } catch {
            setDocenteInfo(null);
          }
        }

        if (u.rol === 'estudiante') {
          try {
            // Use the authenticated estudiante endpoint to get CU/carrera
            const e = await getEstudianteMe();
            // endpoint returns estudiante object with usuario inside
            setEstudianteInfo(e || null);
          } catch {
            setEstudianteInfo(null);
          }
        }
      } catch (err) {
        console.error('Error al cargar perfil', err);
      } finally { setLoading(false); }
    })();
  }, [open]);

  const close = () => { setOpen(false); setEditing(false); };

  const save = async () => {
    try {
      setErrorMsg(null);
      if (newPassword) {
        if (!currentPassword) {
          setErrorMsg('Introduce la contraseña actual para cambiar la contraseña');
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMsg('La nueva contraseña y la confirmación no coinciden');
          return;
        }
      }

      setLoading(true);
      const payload: any = {};
      if (form.nombre) payload.nombre = form.nombre;
      if (form.apellido) payload.apellido = form.apellido;
      if (form.email) payload.email = form.email;
      if (newPassword) {
        payload.password = newPassword;
        payload.currentPassword = currentPassword;
      }
      await updateMyProfile(payload);
      const data = await getUser();
      const u = data.user || data;
      setUser(u);
      setEditing(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setForm({ ...form });
    } catch (err: any) {
      setErrorMsg(err?.message || String(err));
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div className={styles['section__modal']}>
      <div className={styles['section__modal-content']} style={{ width: 520 }}>
        <div className={styles.headerRow}>
          <div className={styles.avatar}>{user?.nombre ? String(user.nombre).charAt(0).toUpperCase() : '?'}</div>
          <div style={{ flex: 1 }}>
            <h3 className={styles['section__modal-title']}>Perfil de usuario</h3>
          </div>
          <div className={styles.headerActions}>
            <button className={styles['section__button']} onClick={() => setEditing((s) => !s)}>{editing ? 'Cancelar' : 'Editar'}</button>
            <button className={`${styles['section__button']} ${styles['section__button--cancel']}`} onClick={close}>Cerrar</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading && <div>Loading...</div>}
          {!loading && user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontWeight: 700 }}>Nombre</label>
                {editing ? (
                  <input className={styles['section-form__input']} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                ) : (
                  <div style={{ padding: '8px 0' }}>{user.nombre}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: 700 }}>Apellido</label>
                {editing ? (
                  <input className={styles['section-form__input']} value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
                ) : (
                  <div style={{ padding: '8px 0' }}>{user.apellido || '-'}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: 700 }}>Correo</label>
                {editing ? (
                  <input className={styles['section-form__input']} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                ) : (
                  <div style={{ padding: '8px 0' }}>{user.email}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: 700 }}>Rol</label>
                <div style={{ padding: '8px 0' }}>{user.rol}</div>
              </div>

              {user.rol === 'docente' && docenteInfo && (
                <div>
                  <label style={{ fontWeight: 700 }}>Especialidad</label>
                  <div style={{ padding: '8px 0' }}>{docenteInfo.especialidad || '-'}</div>
                </div>
              )}

              {user.rol === 'estudiante' && estudianteInfo && (
                <>
                  <div>
                    <label style={{ fontWeight: 700 }}>CU</label>
                    <div style={{ padding: '8px 0' }}>{estudianteInfo.cu || '-'}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 700 }}>Carrera</label>
                    <div style={{ padding: '8px 0' }}>{estudianteInfo.carrera || '-'}</div>
                  </div>
                </>
              )}


              {editing && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label style={{ fontWeight: 700 }}>Contraseña actual</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--color-primary)' }}><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <input type="password" className={styles['section-form__input']} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Contraseña actual" />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 700 }}>Nueva contraseña</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--color-primary)' }}><path d="M12 17v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 11V8a4 4 0 0 0-8 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                      <input type="password" className={styles['section-form__input']} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 700 }}>Confirmar nueva contraseña</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--color-primary)' }}><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <input type="password" className={styles['section-form__input']} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nueva contraseña" />
                    </div>
                  </div>

                  {errorMsg && <div className={styles.error}>{errorMsg}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                    <button className={styles['section__button']} onClick={save} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
