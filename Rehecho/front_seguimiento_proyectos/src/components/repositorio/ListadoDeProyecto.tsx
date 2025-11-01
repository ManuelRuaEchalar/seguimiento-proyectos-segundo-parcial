"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/repositorio/ListadoDeProyectos.module.css";
import { obtenerFinalesAprobados, buscarFinales } from "../../services/finales";

type FinalItem = {
  id: number;
  titulo: string;
  carrera: string;
  año: number;
  estado: string;
  archivo: string;
  fase: string;
  proyecto_id: number;
  tags: any[];
  proyecto?: { id: number; titulo: string; fase_actual?: string; grado_actual?: string };
};

export default function ListadoDeProyecto() {
  const [finales, setFinales] = useState<FinalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);

  // filtros UI
  const [filterAnio, setFilterAnio] = useState<string>("");
  const [filterCarrera, setFilterCarrera] = useState<string>("");
  const [filterFase, setFilterFase] = useState<string>("");

  useEffect(() => {
    // cargar finales aprobados al montar
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerFinalesAprobados();
        setFinales(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Error cargando finales");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // opciones para selects, derivadas de los datos
  const opciones = useMemo(() => {
    const anios = new Set<string>();
    const carreras = new Set<string>();
    const fases = new Set<string>();

    finales.forEach((f) => {
  if (f.año) anios.add(String(f.año));
  if (f.carrera) carreras.add(f.carrera);
  if (f.fase) fases.add(f.fase);
    });

    return {
      anios: Array.from(anios).sort(),
      carreras: Array.from(carreras).sort(),
      fases: Array.from(fases).sort(),
    };
  }, [finales]);

  // Escucha eventos globales de búsqueda (disparados por la barra de búsqueda en la página)
  useEffect(() => {
    async function onBuscarFinales(e: Event) {
      const detail = (e as CustomEvent)?.detail || {};
      setLastSearchQuery(detail.titulo || null);
      setLoading(true);
      setError(null);
      try {
        const filtros: any = {};
        if (detail.titulo) filtros.titulo = detail.titulo;
        if (detail.carrera) filtros.carrera = detail.carrera;
        if (detail.año) filtros.año = detail.año;
        const results = await buscarFinales(filtros);
        setFinales(Array.isArray(results) ? results : []);
      } catch (err: any) {
        setError(err?.message || "Error buscando finales");
      } finally {
        setLoading(false);
      }
    }

    window.addEventListener("buscarFinales", onBuscarFinales as EventListener);
    return () => {
      window.removeEventListener("buscarFinales", onBuscarFinales as EventListener);
    };
  }, []);

  // filtrado local: año, carrera y fase
  const finalesFiltrados = useMemo(() => {
    return finales.filter((f) => {
      if (filterAnio && Number(f.año) !== parseInt(filterAnio)) return false;
      if (filterCarrera && String(f.carrera).toLowerCase() !== filterCarrera.toLowerCase()) return false;
      if (filterFase && String(f.fase).toLowerCase() !== filterFase.toLowerCase()) return false;
      return true;
    });
  }, [finales, filterAnio, filterCarrera, filterFase]);

  return (
    <section className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Filtrar por:</span>

          <select
            className={styles.filterSelect}
            value={filterAnio}
            onChange={(e) => setFilterAnio(e.target.value)}
          >
            <option value="">Año</option>
            {opciones.anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={filterCarrera}
            onChange={(e) => setFilterCarrera(e.target.value)}
          >
            <option value="">Carrera</option>
            {opciones.carreras.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Filtro Estado eliminado: no viene en el endpoint */}

          <select
            className={styles.filterSelect}
            value={filterFase}
            onChange={(e) => setFilterFase(e.target.value)}
          >
            <option value="">Fase</option>
            {opciones.fases.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* No hay filtro por asesor: el endpoint no devuelve ese campo */}

          {/* La búsqueda ahora la maneja la barra en la página (SearchBarClient). */}
        </div>
      </div>

      <div className={styles.grid}>
        {loading && <div>🔄 Cargando finales...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}

        {!loading && !error && finalesFiltrados.length === 0 && (
          <div>
            {lastSearchQuery
              ? "no se encontro datos con su busqueda"
              : "No se encontraron finales."}
          </div>
        )}

        {!loading && !error && finalesFiltrados.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{p.titulo}</h3>
            </div>

            <div className={styles.cardBody}>
              {/* Descripción: si el proyecto tiene título o descripción, muéstrala; en caso contrario usar texto genérico */}
              <p className={styles.cardDesc}>
                {p.proyecto?.titulo || p.titulo || "Titulo del proyecto asociado"}
              </p>

              {/* Label de carrera (como en la maqueta) */}
              <div style={{ marginTop: 6 }}>
                <span className={styles.advisor}>{p.carrera || "Carrera del proyecto"}</span>
              </div>

              <div className={styles.meta}>
                <div className={styles.badges}>
                  <span className={styles.year}>{p.año}</span>
                  <span className={styles.tag}>Fase: {p.fase}</span>
                  {Array.isArray(p.tags) && p.tags.map((t: any, idx: number) => (
                    <span key={idx} className={styles.tag}>{typeof t === 'string' ? t : t.nombre ?? JSON.stringify(t)}</span>
                  ))}
                  <span
                    className={`${styles.status} ${
                      p.estado === "pendiente" || p.estado === "Pendiente"
                        ? styles.statusPending
                        : p.estado === "aprobado" || p.estado === "Aprobado"
                        ? styles.statusDone
                        : styles.statusProgress
                    }`}
                  >
                    {p.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <a href={p.archivo.startsWith("/") ? p.archivo : `/uploads/finales/${p.archivo}`} target="_blank" rel="noreferrer">
                <button className={styles.viewBtn}>Ver documento</button>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
