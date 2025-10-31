import styles from "../../styles/repositorio/ListadoDeProyectos.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  advisor: string;
  year: string;
  tags: string[];
  status: string;
};

const MOCK_PROJECTS: Project[] = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: "Titulo del proyecto de grado que esta aqui",
  description:
    "Descubre los nuevos proyectos que estan desarrollando los estudiantes de la Facultad de Tecnologia",
  advisor: "Ingeniero Baspineiro",
  year: "2025",
  tags: ["CICO", "Perfil"],
  status: i % 3 === 0 ? "Pendiente" : i % 3 === 1 ? "Terminado" : "En proceso",
}));

export default function ListadoDeProyecto() {
  return (
    <section className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Filtrar por:</span>
          <select className={styles.filterSelect}><option>Año</option></select>
          <select className={styles.filterSelect}><option>Carrera</option></select>
          <select className={styles.filterSelect}><option>Estado</option></select>
          <select className={styles.filterSelect}><option>Fase</option></select>
          <select className={styles.filterSelect}><option>Asesor</option></select>
        </div>
      </div>

      <div className={styles.grid}>
        {MOCK_PROJECTS.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{p.title}</h3>
            </div>

            <div className={styles.cardBody}>
              <p className={styles.cardDesc}>{p.description}</p>
              <div className={styles.meta}>
                <span className={styles.advisor}>Asesor: {p.advisor}</span>
                <div className={styles.badges}>
                  <span className={styles.year}>{p.year}</span>
                  {p.tags.map((t, idx) => (
                    <span key={idx} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <div className={styles.statusRow}>
                <span
                  className={`${styles.status} ${
                    p.status === "Pendiente"
                      ? styles.statusPending
                      : p.status === "Terminado"
                      ? styles.statusDone
                      : styles.statusProgress
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button className={styles.viewBtn}>Ver documento</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
