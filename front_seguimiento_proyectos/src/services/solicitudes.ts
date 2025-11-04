export async function crearSolicitud(solicitudData: {
  tipo: 'unirse' | 'invitar';
  proyecto_id: number;
  emisor_id: number;
  receptor_id: number;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/solicitud`;
  console.log('📡 Creando solicitud en:', endpoint);
  console.log('🧩 Datos de la solicitud:', solicitudData);

  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitudData),
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('Solo los estudiantes pueden crear solicitudes.');
    } else if (response.status === 404) {
      throw new Error('El proyecto o los estudiantes especificados no existen.');
    } else if (response.status === 409) {
      throw new Error('Ya existe una solicitud pendiente con estos datos.');
    } else if (response.status === 400) {
      throw new Error('Datos inválidos. Verifica el tipo de solicitud.');
    }

    throw new Error('Error al crear la solicitud');
  }

  const data = await response.json();
  console.log('✅ Solicitud creada:', data);
  return data;
}

export async function responderSolicitud(
  solicitudId: number,
  respuesta: 'aceptado' | 'rechazado'
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/solicitud/${solicitudId}/responder`;
  console.log('📡 Respondiendo solicitud en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ respuesta }),
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para responder esta solicitud.');
    } else if (response.status === 404) {
      throw new Error('Solicitud no encontrada.');
    } else if (response.status === 400) {
      throw new Error('Respuesta inválida.');
    }

    throw new Error('Error al responder la solicitud');
  }

  const data = await response.json();
  console.log('✅ Solicitud respondida:', data);
  return data;
}

export async function obtenerSolicitudesPorEstudiante(estudianteId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/solicitud/estudiante/${estudianteId}`;
  console.log('📡 Obteniendo solicitudes del estudiante en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permiso para ver estas solicitudes.');
    }

    throw new Error('Error al obtener solicitudes');
  }

  const data = await response.json();
  console.log('✅ Solicitudes obtenidas:', data);
  return data;
}

export async function obtenerSolicitudesPendientesDocente(grupoId?: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = grupoId 
    ? `${apiUrl}/solicitud/pendientes-docente?grupo_id=${grupoId}`
    : `${apiUrl}/solicitud/pendientes-docente`;
  console.log('📡 Obteniendo solicitudes pendientes en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('🧩 Detalle del error:', errorData);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('Solo los docentes pueden ver solicitudes pendientes.');
    }

    throw new Error('Error al obtener solicitudes pendientes');
  }

  const data = await response.json();
  console.log('✅ Solicitudes pendientes obtenidas:', data);
  return data;
}