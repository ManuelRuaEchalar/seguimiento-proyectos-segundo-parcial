// src/services/estudiantes.ts

interface Estudiante {
  user_id: string;
  nombre: string;
  apellido: string;
  carrera: string;
  cu: string;
}

/**
 * Obtiene la lista de estudiantes para un grupo específico
 * @param grupo_id ID del grupo del docente
 * @returns Promise con array de estudiantes
 * @throws Error si la petición falla o el usuario no está autorizado
 */
export async function fetchMisEstudiantes(grupo_id: string): Promise<Estudiante[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  try {
    const response = await fetch(`${apiUrl}/users/mis-estudiantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ grupo_id }),
      credentials: 'include', // Incluye cookies para autenticación
    });

    if (response.status === 401) {
      throw new Error('No autorizado');
    }

    if (response.status === 403) {
      throw new Error('Sin permisos para acceder a este recurso');
    }

    if (response.status === 404) {
      throw new Error('Grupo no encontrado');
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validación básica de la respuesta
    if (!Array.isArray(data)) {
      throw new Error('Formato de respuesta inválido');
    }

    return data;
  } catch (error) {
    console.error('Error en fetchMisEstudiantes:', error);
    
    // Re-throw con mensaje más específico si es un error de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    
    throw error;
  }
}

/**
 * Retry logic para fetchMisEstudiantes con exponential backoff
 * @param grupo_id ID del grupo
 * @param maxRetries Número máximo de reintentos (default: 3)
 * @returns Promise con array de estudiantes
 */
export async function fetchMisEstudiantesWithRetry(
  grupo_id: string, 
  maxRetries: number = 3
): Promise<Estudiante[]> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchMisEstudiantes(grupo_id);
    } catch (error) {
      lastError = error as Error;
      
      // No reintentes errores de autorización
      if (lastError.message.includes('401') || lastError.message.includes('403')) {
        throw lastError;
      }
      
      // Si es el último intento, lanza el error
      if (attempt === maxRetries) {
        break;
      }
      
      // Espera antes del siguiente intento (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Falló después de ${maxRetries} intentos: ${lastError!.message}`);
}