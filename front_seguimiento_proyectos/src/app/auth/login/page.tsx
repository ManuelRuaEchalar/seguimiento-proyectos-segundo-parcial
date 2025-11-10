'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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

      if (data.user.rol === 'estudiante' && data.user.grupo) {
        router.push(`/dashboard/${data.user.rol}/proyecto`);
      } else {
        router.push(`/dashboard/${data.user.rol}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <Link href="/">
          <Image
            src="/usfx.png"
            alt="Logo USFX"
            width={160}
            height={160}
            priority
            style={{ cursor: 'pointer' }}
          />
        </Link>
        <h2 className={styles.leftTitle}>SEGUIMIENTO DE PROYECTOS DE GRADO</h2>
        <p className={styles.university}>Universidad San Francisco Xavier de Chuquisaca</p>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.card}>
          <Link href="/">
            <Image
              src="/logo_general.svg"
              alt="logo"
              width={56}
              height={56}
              className={styles.cardIcon}
              priority
              style={{ cursor: 'pointer' }}
            />
          </Link>
          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>Inicia sesión en tu cuenta</p>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}

            <label className={styles.label}>Correo</label>
            <div className={styles.inputGroup}>
              <Image src="/profile.svg" alt="Correo" width={20} height={20} />
              <Input
                label="Correo"
                hideLabel={true}
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputGroup}>
              <Image src="/lock.svg" alt="Contraseña" width={20} height={20} />
              <Input
                label="Contraseña"
                hideLabel={true}
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <Button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Ingresando...' : 'INICIAR SESIÓN'}
            </Button>

            <p className={styles.register}>
              <a href="/auth/register">Regístrate como estudiante...</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}