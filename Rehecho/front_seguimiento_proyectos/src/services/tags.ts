// ==================== TAGS ====================

/**
 * Crear un nuevo tag (solo docentes)
 */
export async function crearTag(tagData: { nombre: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/tag`;
  console.log('📡 Creando tag en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tagData),
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para crear tags.');
    } else if (response.status === 400) {
      throw new Error('Datos inválidos. Verifica que el nombre del tag sea único.');
    }

    throw new Error('Error al crear el tag');
  }

  const data = await response.json();
  console.log('✅ Tag creado:', data);
  return data;
}

/**
 * Obtener todos los tags (público)
 */
export async function obtenerTags() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/tag`;
  console.log('📡 Obteniendo tags:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    throw new Error('Error al obtener los tags');
  }

  const data = await response.json();
  console.log('✅ Tags obtenidos:', data);
  return data;
}

/**
 * Eliminar un tag (solo docentes)
 */
export async function eliminarTag(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/tag/${id}`;
  console.log('📡 Eliminando tag en:', endpoint);

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
      throw new Error('No tienes permiso para eliminar tags.');
    } else if (response.status === 404) {
      throw new Error('Tag no encontrado.');
    }

    throw new Error('Error al eliminar el tag');
  }

  const data = await response.json();
  console.log('✅ Tag eliminado:', data);
  return data;
}