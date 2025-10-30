/**
 * Service para operaciones de documentos
 * Maneja subida de PDFs y otras operaciones relacionadas
 */

export interface Document {
  id: number;
  titulo: string;
  version: number;
  estado: string; // EstadoDocumento enum
  justificacion?: string | null;
  fase: string;
  activo: boolean;
  created_at: string; 
  file: string;
  proyecto_id: number;
}

interface SubirDocumentoResult {
  success: boolean;
  id?: number;
  version?: number;
  error?: string;
}

/**
 * Subir un documento PDF al proyecto y actividad
 * @param archivo Archivo PDF a subir
 * @param proyectoId ID del proyecto
 * @param actividadId ID de la actividad
 * @param titulo Título del documento
 * @returns Resultado de la subida
 */
export const subirDocumento = async (
  archivo: File, 
  proyectoId: number,
  actividadId: number,
  titulo: string
): Promise<SubirDocumentoResult> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return { 
      success: false, 
      error: 'NEXT_PUBLIC_API_URL no está configurada' 
    };
  }

  // Validaciones del cliente
  if (archivo.type !== 'application/pdf') {
    return { 
      success: false, 
      error: 'Solo se permiten archivos PDF' 
    };
  }

  if (archivo.size > 10 * 1024 * 1024) {
    return { 
      success: false, 
      error: 'El archivo excede el tamaño máximo de 10MB' 
    };
  }

  try {
    const formData = new FormData();
    formData.append('documento', archivo, archivo.name); // ✅ Agrega el nombre explícitamente
    formData.append('proyectoId', proyectoId.toString());
    formData.append('actividadId', actividadId.toString());
    formData.append('titulo', titulo);

    console.log('📤 Enviando a:', `${apiUrl}/documento/upload`);

    const response = await fetch(`${apiUrl}/documento/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      // ✅ NO incluyas Content-Type, el navegador lo establece automáticamente
    });

    console.log('📡 Response status:', response.status);

    // ✅ Verifica si la respuesta es JSON antes de parsear
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Respuesta no es JSON:', text);
      return {
        success: false,
        error: 'Respuesta inválida del servidor'
      };
    }

    const data = await response.json();
    console.log('📡 Response data:', data);
    
    if (data.success) {
      console.log('✅ PDF subido exitosamente:', data.id);
      return { 
        success: true,
        version: data.version, 
        id: data.id 
      };
    } else {
      console.error('❌ Error del servidor:', data.error);
      return { 
        success: false, 
        error: data.error || 'Error desconocido del servidor' 
      };
    }
  } catch (error) {
    console.error('💥 Error de conexión:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión al servidor' 
    };
  }
};

/**
 * Obtener información detallada de un documento
 * @param id ID del documento
 * @returns Información del documento
 */
export const obtenerDocumentoInfo = async (id: number): Promise<Document> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  try {
    const response = await fetch(
      `${apiUrl}/documento/doc-info`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo información del documento:', error);
    throw error;
  }
};

/**
 * Obtener documentos de un proyecto por fase
 * @param proyectoId ID del proyecto
 * @param fase Fase del proyecto (tema, perfil, proyecto)
 * @returns Lista de documentos
 */
export const obtenerDocumentos = async (proyectoId: number, fase: string): Promise<Document[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log('Obteniendo documentos para proyectoId:', proyectoId, 'y fase:', fase);
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  try {
    const response = await fetch(
      `${apiUrl}/documento/${proyectoId}?fase=${fase}`, 
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.documentos || [];
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    throw error;
  }
};

/**
 * Obtener un documento (descargar/ver)
 * @param id ID del documento
 * @returns URL del documento o información para mostrarlo
 */
export const obtenerDocumento = async (id: number): Promise<{ 
  url: string; 
  filename: string; 
  mimeType: string;
}> => {
  // Validar que id sea un número válido
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('El ID del documento debe ser un número positivo');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  try {
    const response = await fetch(
      `${apiUrl}/documento/get-doc`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    // Para archivos PDF, podemos crear un blob URL
    if (response.headers.get('content-type')?.includes('application/pdf')) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'documento.pdf';
      
      return {
        url,
        filename,
        mimeType: 'application/pdf'
      };
    }

    // Para otros tipos de archivos, devolver la URL directa
    const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'archivo';
    const mimeType = response.headers.get('content-type') || 'application/octet-stream';
    
    return {
      url: response.url,
      filename,
      mimeType
    };
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    throw error;
  }
};

/**
 * Eliminar un documento
 * @param id ID del documento
 * @param proyectoId ID del proyecto
 * @returns Resultado de la eliminación
 */
export const eliminarDocumento = async (
  id: number, 
  proyectoId: number
): Promise<{ success: boolean; error?: string }> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return { success: false, error: 'NEXT_PUBLIC_API_URL no está configurada' };
  }

  try {
    const response = await fetch(`${apiUrl}/documento/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ proyecto_id: proyectoId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `Error ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error eliminando documento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión' 
    };
  }
};

/**
 * Actualizar estado del documento
 * @param id ID del documento
 * @param estado Nuevo estado (pendiente, en_revision, revisado, aprobado, rechazado)
 * @returns Resultado de la actualización
 */
export const actualizarEstadoDocumento = async (
  id: number,
  estado: string
): Promise<{ success: boolean; error?: string }> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return { success: false, error: 'NEXT_PUBLIC_API_URL no está configurada' };
  }

  // Validar estado
  const estadosValidos = ['pendiente', 'en_revision', 'revisado', 'aprobado', 'rechazado'];
  if (!estadosValidos.includes(estado)) {
    return { 
      success: false, 
      error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ') 
    };
  }

  try {
    const response = await fetch(`${apiUrl}/documento/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ estado }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `Error ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error actualizando estado del documento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión' 
    };
  }
};

/**
 * Obtener documentos por estado
 * @param proyectoId ID del proyecto
 * @param estado Estado específico
 * @returns Lista de documentos filtrados por estado
 */
export const obtenerDocumentosPorEstado = async (
  proyectoId: number,
  estado: string
): Promise<Document[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  try {
    const response = await fetch(
      `${apiUrl}/proyecto/${proyectoId}/documentos?estado=${estado}`, 
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.documentos || [];
  } catch (error) {
    console.error('Error obteniendo documentos por estado:', error);
    throw error;
  }
};

// src/services/documentos.ts

/**
 * Cambiar el estado de un documento
 * @param id ID del documento
 * @param nuevoEstado Nuevo estado (pendiente, en_revision, revisado, aprobado, rechazado)
 * @param justificacion Justificación obligatoria cuando el estado es 'rechazado'
 */
export const cambiarEstadoDocumento = async (
  id: number,
  nuevoEstado: string,
  justificacion?: string
): Promise<{ success: boolean; error?: string }> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return {
      success: false,
      error: 'NEXT_PUBLIC_API_URL no está configurada'
    };
  }

  const estadosValidos = ['pendiente', 'en_revision', 'revisado', 'aprobado', 'rechazado'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return {
      success: false,
      error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
    };
  }

  // Validar que si es rechazo, debe tener justificación
  if (nuevoEstado === 'rechazado' && !justificacion?.trim()) {
    return {
      success: false,
      error: 'Se requiere una justificación para rechazar el documento'
    };
  }

  try {
    const body: { id: number; nuevoEstado: string; justificacion?: string } = {
      id,
      nuevoEstado
    };

    if (nuevoEstado === 'rechazado' && justificacion) {
      body.justificacion = justificacion;
    }

    const response = await fetch(`${apiUrl}/documento/cambiar-estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Error al cambiar el estado' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error cambiando estado del documento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión'
    };
  }
};

/**
 * Obtener todos los documentos de una actividad con sus estudiantes
 * @param actividadId ID de la actividad
 * @returns Lista de documentos con sus proyectos y estudiantes
 */
export const obtenerDocumentosPorActividad = async (actividadId: number) => {
  if (!actividadId || isNaN(actividadId) || actividadId <= 0) {
    throw new Error('El ID de la actividad debe ser un número positivo');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  try {
    const response = await fetch(`${apiUrl}/documento/get-activity-docs/${actividadId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
    }

    return data.data; // Lista de documentos
  } catch (error) {
    console.error('Error obteniendo documentos por actividad:', error);
    throw error;
  }
};

