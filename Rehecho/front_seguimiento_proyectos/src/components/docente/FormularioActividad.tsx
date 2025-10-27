'use client';

import { useState } from 'react';
import { crearActividad } from '@/services/actividades';
import styles from './styles/FormularioActividad.module.css';

interface FormularioActividadProps {
  grupoId: number;
  onActividadCreada: (actividad: any) => void;
}

interface Elemento {
  id: string;
  texto: string;
  tipo: 'requerido' | 'opcional' | 'personalizado';
}

const ELEMENTOS_INICIALES: Elemento[] = [
  { id: '1', texto: 'Título del proyecto', tipo: 'requerido' },
  { id: '2', texto: 'Resumen', tipo: 'requerido' },
  { id: '3', texto: 'Tabla de contenido', tipo: 'requerido' },
  { id: '4', texto: 'Introducción', tipo: 'requerido' },
  { id: '5', texto: 'Antecedentes', tipo: 'requerido' },
  { id: '6', texto: 'Bibliografía', tipo: 'requerido' },
];

const OPCIONES_INICIALES: Elemento[] = [
  { id: '7', texto: 'Problema', tipo: 'opcional' },
  { id: '8', texto: 'Objetivo general', tipo: 'opcional' },
  { id: '9', texto: 'Objetivos específicos', tipo: 'opcional' },
  { id: '10', texto: 'Justificación', tipo: 'opcional' },
  { id: '11', texto: 'Delimitación del proyecto', tipo: 'opcional' },
  { id: '12', texto: 'Marco teórico', tipo: 'opcional' },
  { id: '13', texto: 'Metodología', tipo: 'opcional' },
  { id: '14', texto: 'Desarrollo del proyecto', tipo: 'opcional' },
  { id: '15', texto: 'Conclusiones', tipo: 'opcional' },
];

export default function FormularioActividad({ grupoId, onActividadCreada }: FormularioActividadProps) {
  const [nombreActividad, setNombreActividad] = useState('');
  const [elementosTablero, setElementosTablero] = useState<Elemento[]>(ELEMENTOS_INICIALES);
  const [opciones, setOpciones] = useState<Elemento[]>(OPCIONES_INICIALES);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [notas, setNotas] = useState('');
  const [creando, setCreando] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const manejarInicioArrastre = (e: React.DragEvent, elemento: Elemento, origen: 'tablero' | 'opciones') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('elementoId', elemento.id);
    e.dataTransfer.setData('origen', origen);
    setDraggedItem(elemento.id);
  };

  const manejarArrastreSobreElemento = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const manejarSoltarSobreElemento = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const elementoId = e.dataTransfer.getData('elementoId');
    const origen = e.dataTransfer.getData('origen');

    if (origen === 'tablero') {
      // Reordenar dentro del tablero
      const draggedIndex = elementosTablero.findIndex(el => el.id === elementoId);
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const newElementos = [...elementosTablero];
        const [removed] = newElementos.splice(draggedIndex, 1);
        newElementos.splice(targetIndex, 0, removed);
        setElementosTablero(newElementos);
      }
    } else if (origen === 'opciones') {
      // Agregar desde opciones en posición específica
      const elemento = opciones.find(op => op.id === elementoId);
      if (elemento && !elementosTablero.find(el => el.id === elementoId)) {
        const newElementos = [...elementosTablero];
        newElementos.splice(targetIndex, 0, elemento);
        setElementosTablero(newElementos);
        setOpciones(opciones.filter(op => op.id !== elementoId));
      }
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const manejarSoltarEnTablero = (e: React.DragEvent) => {
    e.preventDefault();
    const elementoId = e.dataTransfer.getData('elementoId');
    const origen = e.dataTransfer.getData('origen');
    
    if (origen === 'opciones') {
      const elemento = opciones.find(op => op.id === elementoId);
      if (elemento && !elementosTablero.find(el => el.id === elementoId)) {
        setOpciones(opciones.filter(op => op.id !== elementoId));
        setElementosTablero([...elementosTablero, elemento]);
      }
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const manejarSoltarEnOpciones = (e: React.DragEvent) => {
    e.preventDefault();
    const elementoId = e.dataTransfer.getData('elementoId');
    const origen = e.dataTransfer.getData('origen');
    
    if (origen === 'tablero') {
      const elemento = elementosTablero.find(el => el.id === elementoId);
      if (elemento && !opciones.find(op => op.id === elementoId)) {
        setElementosTablero(elementosTablero.filter(el => el.id !== elementoId));
        setOpciones([...opciones, elemento]);
      }
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const manejarPermitirSoltar = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const manejarFinArrastre = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const removerElemento = (elementoId: string) => {
    const elemento = elementosTablero.find(el => el.id === elementoId);
    if (elemento) {
      setElementosTablero(elementosTablero.filter(el => el.id !== elementoId));
      setOpciones([...opciones, elemento]);
    }
  };

  const vaciarTablero = () => {
    setOpciones([...opciones, ...elementosTablero]);
    setElementosTablero([]);
  };

  const agregarEtiquetaPersonalizada = () => {
    if (nuevaEtiqueta.trim()) {
      const nuevoElemento: Elemento = {
        id: `personalizado-${Date.now()}`,
        texto: nuevaEtiqueta.trim(),
        tipo: 'personalizado'
      };
      setElementosTablero([...elementosTablero, nuevoElemento]);
      setNuevaEtiqueta('');
    }
  };

  const manejarCrearActividad = async () => {
    if (!nombreActividad.trim()) {
      alert('Debe ingresar un nombre para la actividad');
      return;
    }

    if (elementosTablero.length === 0) {
      alert('Debe agregar al menos un elemento a la actividad');
      return;
    }

    setCreando(true);
    try {
      const actividadData = {
        nombre: nombreActividad.trim(),
        elementos: elementosTablero.map(el => el.texto),
        descripcion: notas,
        grupo_id: grupoId,
      };

      const nuevaActividad = await crearActividad(actividadData);
      onActividadCreada(nuevaActividad.actividad);
      
      // Resetear formulario
      setNombreActividad('');
      setElementosTablero(ELEMENTOS_INICIALES);
      setOpciones(OPCIONES_INICIALES);
      setNotas('');
      setNuevaEtiqueta('');
    } catch (error) {
      console.error('Error creando actividad:', error);
      alert('Error al crear la actividad');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className={styles.presentationSection}>
      <h2 className={styles.sectionTitle}>Crear nueva actividad</h2>

      <div className={styles.nameField}>
        <label className={styles.nameLabel}>
          Nombre de la actividad *
        </label>
        <input
          type="text"
          className={styles.nameInput}
          value={nombreActividad}
          onChange={(e) => setNombreActividad(e.target.value)}
          placeholder="Ej: Proyecto de investigación 2024"
        />
      </div>

      <div className={styles.boardContainer}>
        <div
          className={styles.board}
          onDrop={manejarSoltarEnTablero}
          onDragOver={manejarPermitirSoltar}
        >
          <div className={styles.boardHeader}>
            <div className={styles.boardTitle}>Elementos requeridos:</div>
            <button 
              className={styles.clearBoardBtn} 
              onClick={vaciarTablero}
              title="Vaciar tablero"
              disabled={elementosTablero.length === 0}
            >
              Vaciar
            </button>
          </div>
          {elementosTablero.map((elemento, index) => (
            <div
              key={elemento.id}
              className={`${styles.boardItem} ${draggedItem === elemento.id ? styles.dragging : ''} ${dragOverIndex === index ? styles.dragOver : ''}`}
              draggable
              onDragStart={(e) => manejarInicioArrastre(e, elemento, 'tablero')}
              onDragOver={(e) => manejarArrastreSobreElemento(e, index)}
              onDrop={(e) => manejarSoltarSobreElemento(e, index)}
              onDragEnd={manejarFinArrastre}
            >
              <span className={styles.elementText}>{elemento.texto}</span>
              <button 
                className={styles.removeBtn} 
                onClick={() => removerElemento(elemento.id)}
                title="Quitar"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className={styles.optionsPanel}>
          <div className={styles.optionsTitle}>Opciones adicionales:</div>
          <div
            className={styles.optionsGrid}
            onDrop={manejarSoltarEnOpciones}
            onDragOver={manejarPermitirSoltar}
          >
            {opciones.map((opcion) => (
              <div
                key={opcion.id}
                className={`${styles.optionItem} ${draggedItem === opcion.id ? styles.dragging : ''}`}
                draggable
                onDragStart={(e) => manejarInicioArrastre(e, opcion, 'opciones')}
                onDragEnd={manejarFinArrastre}
              >
                {opcion.texto}
              </div>
            ))}
          </div>

          <div className={styles.customTag}>
            <input
              type="text"
              className={styles.customTagInput}
              placeholder="Nueva etiqueta personalizada"
              value={nuevaEtiqueta}
              onChange={(e) => setNuevaEtiqueta(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && agregarEtiquetaPersonalizada()}
            />
            <button className={styles.addTagBtn} onClick={agregarEtiquetaPersonalizada}>
              +
            </button>
          </div>
        </div>
      </div>

      <textarea
        className={styles.notesField}
        placeholder="Notas adicionales (indicaciones, consejos, etc.)"
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
      />

      <button 
        className={styles.createBtn} 
        onClick={manejarCrearActividad}
        disabled={creando}
      >
        {creando ? 'Creando...' : 'Crear actividad'}
      </button>
    </div>
  );
}