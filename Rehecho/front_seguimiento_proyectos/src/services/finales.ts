// ==================== FINALES ====================

/**
 * Subir un archivo PDF de final
 */
export async function subirFinal(formData: FormData) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/final/upload`;
  console.log('📡 Subiendo final en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    body: formData, // No incluir Content-Type, fetch lo hace automáticamente con FormData
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para subir finales.');
    } else if (response.status === 400) {
      throw new Error(errorData.error || 'Datos inválidos o archivo no permitido.');
    }

    throw new Error('Error al subir el final');
  }

  const data = await response.json();
  console.log('✅ Final subido correctamente:', data);
  return data;
}

/**
 * Obtener todos los finales aprobados (público)
 */
export async function obtenerFinalesAprobados() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/final`;
  console.log('📡 Obteniendo finales aprobados:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    throw new Error('Error al obtener los finales aprobados');
  }

  const data = await response.json();
  console.log('✅ Finales aprobados obtenidos:', data);
  return data;
}

/**
 * Buscar finales por filtros (público)
 */
export async function buscarFinales(filtros: {
  tag?: string;
  carrera?: string;
  año?: string | number;
  titulo?: string;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  // Construir query params
  const params = new URLSearchParams();
  if (filtros.tag) params.append('tag', filtros.tag);
  if (filtros.carrera) params.append('carrera', filtros.carrera);
  if (filtros.año) params.append('año', String(filtros.año));
  if (filtros.titulo) params.append('titulo', filtros.titulo);

  const endpoint = `${apiUrl}/final/buscar?${params.toString()}`;
  console.log('📡 Buscando finales:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    throw new Error('Error al buscar finales');
  }

  const data = await response.json();
  console.log('✅ Finales encontrados:', data);
  return data;
}

/**
 * Actualizar un final (solo docentes)
 */
export async function actualizarFinal(
  id: number,
  datos: {
    titulo?: string;
    carrera?: string;
    año?: number;
    estado?: string;
    fase?: string;
  }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/final/${id}`;
  console.log('📡 Actualizando final en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para actualizar finales.');
    } else if (response.status === 404) {
      throw new Error('Final no encontrado.');
    }

    throw new Error('Error al actualizar el final');
  }

  const data = await response.json();
  console.log('✅ Final actualizado:', data);
  return data;
}

/**
 * Eliminar un final (solo docentes)
 */
export async function eliminarFinal(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/final/${id}`;
  console.log('📡 Eliminando final en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para eliminar finales.');
    } else if (response.status === 404) {
      throw new Error('Final no encontrado.');
    }

    throw new Error('Error al eliminar el final');
  }

  const data = await response.json();
  console.log('✅ Final eliminado:', data);
  return data;
}

export async function fetchFinal(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/final/get-doc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(`Error al cargar el documento final: ${response.status}`);
  }

  // ✅ USAR ARRAYBUFFER PARA GARANTIZAR DESCARGA COMPLETA
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('Content-Type') || 'application/pdf';
  
  // Crear Blob desde ArrayBuffer (más confiable)
  const blob = new Blob([arrayBuffer], { type: contentType });
  
  console.log('✅ Documento final descargado:', blob.size, 'bytes, tipo:', contentType);

  return { blob, contentType };
}