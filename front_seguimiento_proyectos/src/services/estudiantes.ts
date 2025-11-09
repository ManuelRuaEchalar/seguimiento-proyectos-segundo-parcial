export async function fetchEstudianteInfo() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/estudiante/info`;

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include', // ⭐ Enviar cookies automáticamente
  });

  if (!response.ok) {
    const errorData = await response.text();

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para acceder a esta información (rol inválido).');
    } else if (response.status === 404) {
      throw new Error('Estudiante no encontrado');
    }

    throw new Error('Error al obtener los datos del estudiante');
  }

  const data = await response.json();
  return data;
}

export async function fetchStudentDocuments(actividadId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/documento/student-docs?actividad_id=${actividadId}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include', // ⭐ Enviar cookies automáticamente
  });

  if (!response.ok) {
    const errorData = await response.text();

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para acceder a esta información.');
    } else if (response.status === 404) {
      throw new Error('Estudiante, proyecto o actividad no encontrado');
    } else if (response.status === 400) {
      throw new Error('Solicitud inválida. Verifica los parámetros.');
    }

    throw new Error('Error al obtener los documentos del estudiante');
  }

  const data = await response.json();

  return data;
}

// @/services/estudiante.ts
export async function getConfiguracionProyecto() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/estudiante/configuracion-proyecto`;

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener la configuración del proyecto');
  }

  const data = await response.json();
  return data;
}

export async function actualizarTituloProyecto(proyectoId: number, titulo: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/estudiante/proyecto/${proyectoId}/titulo`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ titulo }),
  });

  if (!response.ok) {
    const errorData = await response.text();

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 404) {
      throw new Error('Proyecto no encontrado');
    } else if (response.status === 400) {
      throw new Error('Datos inválidos para actualizar el título');
    }

    throw new Error('Error al actualizar el título del proyecto');
  }

  const data = await response.json();
  return data;
}