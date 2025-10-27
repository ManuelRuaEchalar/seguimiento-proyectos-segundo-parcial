export async function fetchEstudianteInfo() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/estudiante/info`;
  console.log('📡 Solicitando info del estudiante a:', endpoint);

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
      throw new Error('Estudiante no encontrado');
    }

    throw new Error('Error al obtener los datos del estudiante');
  }

  const data = await response.json();
  console.log('✅ Respuesta del servidor:', data);
  return data;
}

export async function fetchStudentDocuments(actividadId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/documento/student-docs?actividad_id=${actividadId}`;
  console.log('📡 Solicitando documentos del estudiante:', endpoint);

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
      throw new Error('Estudiante, proyecto o actividad no encontrado');
    } else if (response.status === 400) {
      throw new Error('Solicitud inválida. Verifica los parámetros.');
    }

    throw new Error('Error al obtener los documentos del estudiante');
  }

  const data = await response.json();
  console.log('✅ Documentos obtenidos:', data);
  return data;
}