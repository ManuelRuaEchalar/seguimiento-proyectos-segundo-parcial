"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/repositorio/ListadoDeProyectos.module.css";
import { obtenerFinalesAprobados, buscarFinales } from "../../services/finales";
import { obtenerTags } from "@/services/tags";

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

type Tag = {
  id: number;
  nombre: string;
};

const TAGS_INICIAL = 10; // Mostrar inicialmente 10 tags
const TAGS_POR_PAGINA = 10; // Cargar 10 más cada vez

export default function ListadoDeProyecto() {
  const router = useRouter();
  const [finales, setFinales] = useState<FinalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);

  // Tags
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagsVisibles, setTagsVisibles] = useState(TAGS_INICIAL);
  const [searchTag, setSearchTag] = useState("");

  // filtros UI
  const [filterAnio, setFilterAnio] = useState<string>("");
  const [filterCarrera, setFilterCarrera] = useState<string>("");
  const [filterFase, setFilterFase] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerFinalesAprobados();
        setFinales(Array.isArray(data) ? data : []);
        
        const tagsData = await obtenerTags();
        console.log("Tags obtenidos:", tagsData);
        setAllTags(Array.isArray(tagsData) ? tagsData : []);
      } catch (e: any) {
        setError(e?.message || "Error cargando finales");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  const handleTagClick = (tagId: number) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, tagId];
      }
    });
  };

  // Filtrar tags por búsqueda
  const tagsFiltrados = useMemo(() => {
    if (!searchTag.trim()) return allTags;
    
    const termino = searchTag.toLowerCase();
    return allTags.filter(tag => 
      tag.nombre.toLowerCase().includes(termino)
    );
  }, [allTags, searchTag]);

  // Tags a mostrar (respetando el límite de visibles)
  const tagsMostrados = useMemo(() => {
    return tagsFiltrados.slice(0, tagsVisibles);
  }, [tagsFiltrados, tagsVisibles]);

  const hayMasTags = tagsFiltrados.length > tagsVisibles;

  const finalesFiltrados = useMemo(() => {
    return finales.filter((f) => {
      if (filterAnio && Number(f.año) !== parseInt(filterAnio)) return false;
      if (filterCarrera && String(f.carrera).toLowerCase() !== filterCarrera.toLowerCase()) return false;
      if (filterFase && String(f.fase).toLowerCase() !== filterFase.toLowerCase()) return false;
      
      if (selectedTags.length > 0) {
        const finalTagIds = f.tags.map((t: any) => 
          typeof t === 'object' && t.id ? t.id : null
        ).filter(Boolean);
        
        const hasSelectedTag = selectedTags.some((selectedId) => 
          finalTagIds.includes(selectedId)
        );
        
        if (!hasSelectedTag) return false;
      }
      
      return true;
    });
  }, [finales, filterAnio, filterCarrera, filterFase, selectedTags]);

  const handleVerDocumento = (finalId: number) => {
    router.push(`/repositorio/${finalId}`);
  };

  const cargarMasTags = () => {
    setTagsVisibles(prev => prev + TAGS_POR_PAGINA);
  };

  const mostrarMenosTags = () => {
    setTagsVisibles(TAGS_INICIAL);
  };

  const limpiarSeleccion = () => {
    setSelectedTags([]);
  };

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
        </div>

        {allTags.length > 0 && (
          <div className={styles.tagsFilterSection}>
            <div className={styles.tagsFilterHeader}>
              <span className={styles.filterLabel}>
                Temas ({selectedTags.length}/5):
              </span>
              {selectedTags.length > 0 && (
                <button 
                  onClick={limpiarSeleccion}
                  className={styles.clearButton}
                >
                  Limpiar selección
                </button>
              )}
            </div>

            {allTags.length > TAGS_INICIAL && (
              <input
                type="text"
                placeholder="Buscar tema..."
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                className={styles.searchInput}
              />
            )}

            <div className={styles.tagsContainer}>
              {tagsMostrados.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const isDisabled = !isSelected && selectedTags.length >= 5;
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    disabled={isDisabled}
                    className={`${styles.tagButton} ${isSelected ? styles.tagButtonSelected : ''} ${isDisabled ? styles.tagButtonDisabled : ''}`}
                  >
                    {tag.nombre}
                  </button>
                );
              })}
            </div>

            {(hayMasTags || tagsVisibles > TAGS_INICIAL) && (
              <div className={styles.tagsPaginacion}>
                {hayMasTags && (
                  <button 
                    onClick={cargarMasTags}
                    className={styles.verMasButton}
                  >
                    Ver más temas ({tagsFiltrados.length - tagsVisibles} restantes)
                  </button>
                )}
                {tagsVisibles > TAGS_INICIAL && (
                  <button 
                    onClick={mostrarMenosTags}
                    className={styles.verMenosButton}
                  >
                    Ver menos
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {loading && <div>🔄 Cargando finales...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}

        {!loading && !error && finalesFiltrados.length === 0 && (
          <div>
            {lastSearchQuery
              ? "No se encontraron datos con su búsqueda"
              : "No se encontraron finales."}
          </div>
        )}

        {!loading && !error && finalesFiltrados.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{p.titulo}</h3>
            </div>

            <div className={styles.cardBody}>
              <p className={styles.cardDesc}>
                {p.proyecto?.titulo || p.titulo || "Título del proyecto asociado"}
              </p>

              <div className={styles.advisorContainer}>
                <span className={styles.advisor}>{p.carrera || "Carrera del proyecto"}</span>
              </div>

              <div className={styles.meta}>
                <div className={styles.badges}>
                  <span className={styles.year}>{p.año}</span>
                  <span className={styles.tag}>Fase: {p.fase}</span>
                  {Array.isArray(p.tags) && p.tags.map((t: any, idx: number) => (
                    <span key={idx} className={styles.tag}>
                      {typeof t === 'string' ? t : t.nombre ?? JSON.stringify(t)}
                    </span>
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
              <button 
                className={styles.viewBtn}
                onClick={() => handleVerDocumento(p.id)}
              >
                Ver documento
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}