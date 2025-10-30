export async function fetchEstudianteById(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  // NO obtener token manualmente ni enviar en header
  // Solo verificar si hay sesión (opcional, via otro endpoint)

  console.log('URL de solicitud:', `${apiUrl}/estudiante/get-by-id`);

  const response = await fetch(`${apiUrl}/estudiante/get-by-id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
    credentials: 'include',  // ⭐ Clave: envía cookies cross-origin
  });

  if (!response.ok) {
    console.log('Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.log('Detalle del error:', errorData);
    
    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');  // Mensaje más preciso
    } else if (response.status === 403) {  // Para authz (rol)
      throw new Error('No tienes permiso para acceder a este estudiante. Asegúrate de estar autenticado como docente.');
    } else if (response.status === 404) {
      throw new Error('Estudiante no encontrado');
    }
    
    throw new Error('Error al obtener los datos del estudiante');
  }

  const data = await response.json();
  console.log('Respuesta del servidor:', data);
  return data;
}

export async function fetchDocumentosPendientes() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  console.log('🔍 Solicitando documentos pendientes desde:', `${apiUrl}/documento/get-pendientes`);

  const response = await fetch(`${apiUrl}/documento/get-pendientes`, {
    method: 'GET',
    credentials: 'include', // Envía la cookie httpOnly con el access_token
  });

  if (!response.ok) {
    console.error('❌ Error al obtener documentos pendientes:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para ver los documentos pendientes.');
    }

    throw new Error('Error al obtener documentos pendientes.');
  }

  const data = await response.json();
  console.log('✅ Documentos pendientes recibidos:', data);
  return data;
}

export async function fetchDocenteInfo() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/docente/info`;
  console.log('📡 Solicitando info del docente a:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include', // ⭐ Enviar cookies automáticamente
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para acceder a esta información (rol inválido).');
    } else if (response.status === 404) {
      throw new Error('Docente no encontrado');
    }

    throw new Error('Error al obtener los datos del docente');
  }

  const data = await response.json();
  console.log('✅ Respuesta del servidor:', data);
  return data;
}

export async function fetchTeacherObservations(
  estudianteId: number,
  actividadId: number
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/documento/teacher-observations?estudiante_id=${estudianteId}&actividad_id=${actividadId}`;
  console.log('📡 Solicitando observaciones del docente:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include', // ⭐ Enviar cookies automáticamente
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para acceder a esta información.');
    } else if (response.status === 404) {
      throw new Error('Docente, estudiante, proyecto o actividad no encontrado');
    } else if (response.status === 400) {
      throw new Error('Solicitud inválida. Verifica los parámetros.');
    }

    throw new Error('Error al obtener las observaciones del docente');
  }

  const data = await response.json();
  console.log('✅ Observaciones obtenidas:', data);
  return data;
}

export async function actualizarElementosGrupo(
  grupoId: number,
  elementos: any
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/grupos/${grupoId}/elementos`;
  console.log('📡 Actualizando elementos del grupo en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ elementos }),
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para actualizar elementos del grupo.');
    } else if (response.status === 404) {
      throw new Error('El grupo especificado no existe.');
    }

    throw new Error('Error al actualizar elementos del grupo');
  }

  const data = await response.json();
  console.log('✅ Elementos del grupo actualizados:', data);
  return data;
}

