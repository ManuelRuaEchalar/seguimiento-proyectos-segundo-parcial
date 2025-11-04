import React from 'react';
import styles from './styles/Navbar.module.css';

interface NavbarProps {
  nombre: string;
  apellido: string;
  email: string;
  cu: string;
  carrera: string;
  grupo: string;
}

export default function Navbar({
  nombre,
  apellido,
  email,
  cu,
  carrera,
  grupo,
}: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Mi Proyecto</h1>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Estudiante:</span>
              <span className={styles.value}>{nombre} {apellido}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{email}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>CU:</span>
              <span className={styles.value}>{cu}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Carrera:</span>
              <span className={styles.value}>{carrera}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Grupo:</span>
              <span className={styles.value}>{grupo}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}