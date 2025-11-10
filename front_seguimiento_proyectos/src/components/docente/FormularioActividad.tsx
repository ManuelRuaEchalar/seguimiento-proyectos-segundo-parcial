'use client';

import { useState, useEffect } from 'react';
import { crearActividad } from '@/services/actividades';
import styles from './styles/FormularioActividad.module.css';

interface FormularioActividadProps {
  grupoId: number;
  elementosGrupo: string[];
  fase: 'tema' | 'perfil' | 'proyecto';
  onActividadCreada: (actividad: any, grupo: any) => void; // Cambiado para recibir grupo
}

interface Elemento {
  id: string;
  texto: string;
}

export default function FormularioActividad({ grupoId, elementosGrupo,fase, onActividadCreada }: FormularioActividadProps) {
  const [nombreActividad, setNombreActividad] = useState('');
  const [elementosTablero, setElementosTablero] = useState<Elemento[]>([]);
  const [opciones, setOpciones] = useState<Elemento[]>([]);
  const [notas, setNotas] = useState('');
  const [creando, setCreando] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Inicializar elementos desde los elementos del grupo
  useEffect(() => {
    if (elementosGrupo && elementosGrupo.length > 0) {
      const elementos = elementosGrupo.map((texto, index) => ({
        id: `elemento-${index}`,
        texto: texto
      }));

      // Primeros 3 elementos (o menos si hay menos de 3) van al tablero
      const elementosIniciales = elementos.slice(0, Math.min(3, elementos.length));
      // El resto va a opciones
      const opcionesIniciales = elementos.slice(Math.min(3, elementos.length));

      setElementosTablero(elementosIniciales);
      setOpciones(opcionesIniciales);
    }
  }, [elementosGrupo]);

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
      fase: fase,
      descripcion: notas,
      es_final: false,
      grupo_id: grupoId,
    };

    const respuesta = await crearActividad(actividadData);
    
    // Pasar tanto la actividad como el grupo actualizado
    onActividadCreada(respuesta.actividad, respuesta.grupo);
    
    // Resetear formulario a estado inicial
    setNombreActividad('');
    setNotas('');
    
    // Reinicializar elementos con los datos actualizados del grupo
    if (respuesta.grupo && respuesta.grupo.elementos) {
      const elementosRestantes = respuesta.grupo.elementos as string[];
      
      // Mapear los elementos restantes con nuevos IDs
      const elementos = elementosRestantes.map((texto, index) => ({
        id: `elemento-restante-${Date.now()}-${index}`,
        texto: texto
      }));
      
      // Repartir los elementos restantes
      const elementosIniciales = elementos.slice(0, Math.min(3, elementos.length));
      const opcionesIniciales = elementos.slice(Math.min(3, elementos.length));
      setElementosTablero(elementosIniciales);
      setOpciones(opcionesIniciales);
    } else {
      // Si no hay elementos restantes, limpiar todo
      setElementosTablero([]);
      setOpciones([]);
    }
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