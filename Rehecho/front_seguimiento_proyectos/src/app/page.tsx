import Image from "next/image";
import Header from "../components/Header";
import ListadoDeProyecto from "../components/repositorio/ListadoDeProyecto";
import SearchBarClient from "../components/SearchBarClient";
import styles from "../styles/landingpage.module.css";

export default function Home() {
  return (
    <div>
      <Header
        actions={[
          { label: "Iniciar sesión", href: "/auth/login", variant: "ghost" },
          { label: "Registrarse", href: "/auth/register", variant: "primary" },
        ]}
      />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>Explora Nuevos Proyectos</h2>
            <p className={styles.heroSubtitle}>
              Descubre lo nuevos proyectos e ideas que estan desarrollando los
              estudiantes de la Facultad de Tecnologia
            </p>

            <div className={styles.searchBar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <SearchBarClient />
            </div>
          </div>

          <div className={styles.heroImage}>
            <Image src="/computadoralanding.svg" alt="computadora" width={360} height={240} />
          </div>
        </section>

        <ListadoDeProyecto />
      </main>
    </div>
  );
}
