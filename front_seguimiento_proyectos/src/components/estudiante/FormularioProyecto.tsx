'use client';

import React, { useState } from 'react';
import { createProyecto, asignarProyecto } from '@/services/api';
import styles from './styles/FormularioProyecto.module.css';

interface FormularioProyectoProps {
  onProyectoCreado: (proyectoId: number) => void;
}

export default function FormularioProyecto({
  onProyectoCreado,
}: FormularioProyectoProps) {
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!titulo.trim()) {
      setError('El título del proyecto es obligatorio');
      return;
    }

    if (titulo.trim().length < 5) {
      setError('El título debe tener al menos 5 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Crear el proyecto
      const proyectoResponse = await createProyecto(titulo.trim());
      const proyectoId = proyectoResponse.proyecto.id;

      // Asignar el proyecto al estudiante
      await asignarProyecto(proyectoId);

      setSuccess('Proyecto creado exitosamente');
      setTitulo('');

      // Notificar al componente padre
      setTimeout(() => {
        onProyectoCreado(proyectoId);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.headerForm}>
        <h2 className={styles.titleForm}>Crear Mi Proyecto</h2>
        <p className={styles.descriptionForm}>
          Ingresa un título para tu proyecto de grado. Podrás comenzar a trabajar en las diferentes etapas una vez que sea aprobado por el docente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="titulo" className={styles.label}>
            Título del Proyecto
          </label>
          <input
            type="text"
            id="titulo"
            className={styles.input}
            placeholder="Ej: Sistema de gestión de expedientes académicos"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={loading}
            maxLength={150}
          />
          <span className={styles.charCount}>
            {titulo.length}/150 caracteres
          </span>
        </div>

        {error && <div className={styles.alert + ' ' + styles.alertError}>{error}</div>}
        {success && <div className={styles.alert + ' ' + styles.alertSuccess}>{success}</div>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Creando proyecto...' : 'Crear Proyecto'}
        </button>
      </form>
    </div>
  );
}