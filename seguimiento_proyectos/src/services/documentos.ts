/**
 * Service para operaciones de documentos
 * Maneja subida de PDFs y otras operaciones relacionadas
 */

interface Document {
  codigoDoc: number;
  titulo: string;
  version: number;
  file: string;
  proyectoId: number;
}

interface SubirDocumentoResult {
  success: boolean;
  codigoDoc?: number;
  error?: string;
}

/**
 * Subir un documento PDF al proyecto
 * @param archivo Archivo PDF a subir
 * @param proyectoId ID del proyecto (codigoProyecto)
 * @param titulo Título del documento
 * @returns Resultado de la subida
 */
export const subirDocumento = async (
  archivo: File, 
  proyectoId: number, 
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
    formData.append('documento', archivo);
    formData.append('proyectoId', proyectoId.toString());
    formData.append('titulo', titulo);

    const response = await fetch(`${apiUrl}/documento/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Para cookies de autenticación
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('PDF subido exitosamente:', data.codigoDoc);
      return { 
        success: true, 
        codigoDoc: data.codigoDoc 
      };
    } else {
      console.error('Error del servidor:', data.error);
      return { 
        success: false, 
        error: data.error || 'Error desconocido del servidor' 
      };
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión al servidor' 
    };
  }
};

/**
 * Obtener documentos de un proyecto
 * @param proyectoId ID del proyecto
 * @returns Lista de documentos
 */
export const obtenerDocumentos = async (proyectoId: number): Promise<Document[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  try {
    const response = await fetch(
      `${apiUrl}/proyecto/${proyectoId}/documentos`, 
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
 * Eliminar un documento
 * @param codigoDoc ID del documento
 * @param proyectoId ID del proyecto
 * @returns Resultado de la eliminación
 */
export const eliminarDocumento = async (
  codigoDoc: number, 
  proyectoId: number
): Promise<{ success: boolean; error?: string }> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return { success: false, error: 'NEXT_PUBLIC_API_URL no está configurada' };
  }

  try {
    const response = await fetch(`${apiUrl}/documento/${codigoDoc}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ proyectoId }),
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