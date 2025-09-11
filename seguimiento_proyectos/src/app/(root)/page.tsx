// app/(root)/page.tsx
'use client';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {user ? (
        <div className="user-info">
          <h2>Bienvenido, {user.nombre} {user.apellido}</h2>
          <p>Email: {user.email}</p>
          <p>Rol: {user.rol}</p>
        </div>
      ) : (
        <>
          <section className="hero">
            <h2>Bienvenido a tu Plataforma Educativa</h2>
            <p>Conecta con tus cursos, profesores y compañeros de estudio.</p>
            <div className="hero-buttons">
              <a href="/sign-in" className="btn btn-primary">Iniciar Sesión</a>
              <a href="/sign-up" className="btn btn-secondary">Registrarse</a>
            </div>
          </section>

          <section className="features">
            <div className="feature">
              <h3>Para Estudiantes</h3>
              <p>Accede a tus materiales, tareas y calificaciones en un solo lugar.</p>
            </div>
            
            <div className="feature">
              <h3>Para Docentes</h3>
              <p>Gestiona tus clases, estudiantes y contenido académico fácilmente.</p>
            </div>
            
            <div className="feature">
              <h3>Colaboración</h3>
              <p>Herramientas integradas para trabajo en equipo y comunicación.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;