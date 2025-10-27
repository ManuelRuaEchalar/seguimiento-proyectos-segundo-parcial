export async function crearActividad(actividadData: {
  nombre: string;
  elementos: any;
  descripcion?: string;
  grupo_id: number;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/actividad`;
  console.log('📡 Creando actividad en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actividadData),
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para crear actividades.');
    } else if (response.status === 404) {
      throw new Error('El grupo especificado no existe.');
    }

    throw new Error('Error al crear la actividad');
  }

  const data = await response.json();
  console.log('✅ Actividad creada:', data);
  return data;
}

export async function borrarActividad(actividadId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/actividad/${actividadId}`;
  console.log('📡 Borrando actividad en:', endpoint);

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
      throw new Error('No tienes permiso para borrar actividades.');
    } else if (response.status === 404) {
      throw new Error('Actividad no encontrada.');
    }

    throw new Error('Error al borrar la actividad');
  }

  const data = await response.json();
  console.log('✅ Actividad borrada:', data);
  return data;
}

export async function editarActividad(actividadId: number, actividadData: {
  nombre?: string;
  elementos?: any;
  descripcion?: string;
  estado?: string;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/actividad/${actividadId}`;
  console.log('📡 Editando actividad en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actividadData),
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para editar actividades.');
    } else if (response.status === 404) {
      throw new Error('Actividad no encontrada.');
    }

    throw new Error('Error al editar la actividad');
  }

  const data = await response.json();
  console.log('✅ Actividad editada:', data);
  return data;
}

export async function obtenerActividadesPorGrupo(grupoId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/actividad/grupo/${grupoId}`;
  console.log('📡 Obteniendo actividades del grupo:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para ver estas actividades.');
    } else if (response.status === 404) {
      throw new Error('Grupo no encontrado.');
    }

    throw new Error('Error al obtener las actividades del grupo');
  }

  const data = await response.json();
  console.log('✅ Actividades obtenidas:', data);
  return data;
}