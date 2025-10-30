'use client';

import { useState } from 'react';
import { actualizarElementosGrupo } from '@/services/docentes';
import styles from './styles/FormularioActividad.module.css';

interface FormularioFormatoDocumentoProps {
  grupoId: number;
  onElementosGuardados: () => void;
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

export default function FormularioFormatoDocumento({ grupoId, onElementosGuardados }: FormularioFormatoDocumentoProps) {
  const [elementosTablero, setElementosTablero] = useState<Elemento[]>(ELEMENTOS_INICIALES);
  const [opciones, setOpciones] = useState<Elemento[]>(OPCIONES_INICIALES);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito' | null; texto: string }>({ tipo: null, texto: '' });
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
      const draggedIndex = elementosTablero.findIndex(el => el.id === elementoId);
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const newElementos = [...elementosTablero];
        const [removed] = newElementos.splice(draggedIndex, 1);
        newElementos.splice(targetIndex, 0, removed);
        setElementosTablero(newElementos);
      }
    } else if (origen === 'opciones') {
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

  const manejarGuardarFormato = async () => {
    // Limpiar mensaje anterior
    setMensaje({ tipo: null, texto: '' });

    if (elementosTablero.length === 0) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Debe agregar al menos un elemento al formato del documento' 
      });
      return;
    }

    setGuardando(true);
    try {
      const elementos = elementosTablero.map(el => el.texto);
      await actualizarElementosGrupo(grupoId, elementos);
      
      // Actualizar localStorage
      const grupoGuardado = localStorage.getItem('grupoActual');
      if (grupoGuardado) {
        const grupoData = JSON.parse(grupoGuardado);
        grupoData.elementos = elementos;
        localStorage.setItem('grupoActual', JSON.stringify(grupoData));
      }
      
      // Mostrar mensaje de éxito brevemente antes de recargar
      setMensaje({ 
        tipo: 'exito', 
        texto: 'Formato de documento guardado exitosamente. Recargando...' 
      });
      
      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error guardando formato:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error instanceof Error ? error.message : 'Error al guardar el formato del documento' 
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.presentationSection}>
      <h2 className={styles.sectionTitle}>Estructura de documento de la materia</h2>
      
      <p style={{ 
        marginBottom: '20px', 
        color: 'var(--carbon)', 
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        Por favor elabora la estructura del documento que el grupo va a realizar durante esta fase del curso, 
        arrastra, quita o crea los elementos necesarios
      </p>

      {mensaje.tipo && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          backgroundColor: mensaje.tipo === 'error' ? '#fee' : '#efe',
          border: `1px solid ${mensaje.tipo === 'error' ? '#fcc' : '#cfc'}`,
          color: mensaje.tipo === 'error' ? '#c33' : '#363',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {mensaje.texto}
        </div>
      )}

      <div className={styles.boardContainer}>
        <div
          className={styles.board}
          onDrop={manejarSoltarEnTablero}
          onDragOver={manejarPermitirSoltar}
        >
          <div className={styles.boardHeader}>
            <div className={styles.boardTitle}>Elementos del documento:</div>
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

      <button 
        className={styles.createBtn} 
        onClick={manejarGuardarFormato}
        disabled={guardando}
      >
        {guardando ? 'Guardando...' : 'Guardar formato de documento final'}
      </button>
    </div>
  );
}