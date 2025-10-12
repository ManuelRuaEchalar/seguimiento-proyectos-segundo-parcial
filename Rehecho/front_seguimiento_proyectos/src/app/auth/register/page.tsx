'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { register } from '@/services/api';

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <h1>Registrarse</h1>
        {error && <p>{error}</p>}
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
          label="Código Único (CU)"
          type="text"
          name="cu"
          placeholder="Código Único"
          value={form.cu}
          onChange={handleChange}
          required
        />
        <Input
          label="Carrera"
          type="text"
          name="carrera"
          placeholder="Carrera"
          value={form.carrera}
          onChange={handleChange}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
        <p>
          ¿Ya tienes cuenta? <a href="/auth/login">Inicia sesión</a>
        </p>
      </form>
    </div>
  );
}