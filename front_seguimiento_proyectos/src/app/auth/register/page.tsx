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
    rol: 'estudiante',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await register(form);
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
      <div className={styles.leftSection}>
        <h2>SEGUIMIENTO DE PROYECTOS DE GRADO</h2>
        <Image
          src="/images/EscudoUSFX (2).png"
          alt="Escudo USFX"
          width={800}
          height={800}
          priority
        />
        <p>Universidad San Francisco Xavier de Chuquisaca</p>
      </div>

      <div className={styles.rightSection}>
        <form onSubmit={handleRegister} className={styles.formCard}>
          <h1>Registrarse</h1>
          {error && <p className={styles.error}>{error}</p>}

          <Input
            label="Nombre"
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <Input
            label="Apellido"
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Input
            label="Carnet universitario"
            type="text"
            name="cu"
            placeholder="CU"
            value={form.cu}
            onChange={handleChange}
            required
          />

          {/* Select de carreras */}
          <label htmlFor="carrera">Carrera</label>
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
            <option value="Ingeniería de Sistemas">
              Ingeniería de Sistemas
            </option>
            <option value="Diseño y Animación Digital">
              Diseño y Animación Digital
            </option>
          </select>

          <Button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <p>
            ¿Ya tienes cuenta? <a href="/auth/login">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  );
}
