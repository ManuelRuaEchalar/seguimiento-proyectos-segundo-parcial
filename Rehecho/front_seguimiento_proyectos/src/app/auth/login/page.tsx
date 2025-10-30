'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { login } from '@/services/api';
import styles from '@/styles/Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      router.push(`/dashboard/${data.user.rol}`);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

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
        <form onSubmit={handleLogin} className={styles.formCard}>
          <h1>Iniciar Sesión</h1>
          {error && <p className={styles.error}>{error}</p>}
          <Input
            label="Email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
          <p>
            No tienes cuenta? <a href="/auth/register">Regístrate aquí</a>
          </p>
        </form>
      </div>
    </div>
  );
}