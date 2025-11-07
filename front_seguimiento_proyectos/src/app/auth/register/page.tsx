'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { register } from '@/services/api';
import styles from '@/styles/Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    cu: '',
    carrera: '',
    rol: 'estudiante' as const, // ← CAMBIO AQUÍ
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(form);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.centerCard}>
        <div className={styles.formCard}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Image
              src="/logo_general.svg"
              alt="logo"
              width={56}
              height={56}
              priority
            />
            <h1 className={styles.mainTitle}>Registra tu cuenta de estudiante</h1>
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <form onSubmit={handleRegister} className={styles.formInner}>
          <div className={styles.rowTwo}>
            <Input
              label="Nombres"
              type="text"
              name="nombre"
              placeholder="Ingresa tu nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <Input
              label="Apellidos"
              type="text"
              name="apellido"
              placeholder="Ingresa tu apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.rowTwo}>
            <Input
              label="Carnet Universitario"
              type="text"
              name="cu"
              placeholder="Ingresa tu CU"
              value={form.cu}
              onChange={handleChange}
              required
            />
            <Input
              label="Correo"
              type="email"
              name="email"
              placeholder="Ingresa tu correo"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.rowTwo}>
            <div style={{ flex: 1 }}>
              <label htmlFor="carrera" className={styles.label}>Carrera</label>
              <select
                id="carrera"
                name="carrera"
                value={form.carrera}
                onChange={handleChange}
                required
                className={styles.select}
              >
                <option value="">Selecciona una carrera</option>
                <option value="Ingeniería en Ciencias de la Computación">
                  Ingeniería en Ciencias de la Computación
                </option>
                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                <option value="Diseño y Animación Digital">Diseño y Animación Digital</option>
              </select>
            </div>

            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'CREAR CUENTA'}
          </Button>

          </form>

          <p style={{ textAlign: 'center', marginTop: 12 }}>
            <a className={styles.loginLink} href="/auth/login">Iniciar sesión...</a>
          </p>
        </div>
      </div>
    </div>
  );
}