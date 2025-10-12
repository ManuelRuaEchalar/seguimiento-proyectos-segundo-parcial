import { User, Group } from "../types";

export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error en login");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}
export async function logout(): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to logout");
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function register(data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  cu: string;
  carrera: string;
  rol: "estudiante";
}) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    const response = await res.json();
    if (!res.ok) throw new Error(response.message || "Error en registro");
    return response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function getUser() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
      credentials: "include",
    });
    // Some backends return the user directly, others return { user: {...} }
    const data = await res.json();
    if (!res.ok) {
      // Provide clearer message on 401 to aid UI decisions
      if (res.status === 401) {
        throw new Error("No autorizado");
      }
      throw new Error(data?.message || "Error al obtener usuario");
    }
    // Normalize shape to always return { user: ... }
    if (data && typeof data === "object" && "user" in data) {
      return data as { user: unknown };
    }
    return { user: data };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function getUsers() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener usuarios");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function createUser(data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  cu?: string;
  carrera?: string;
  especialidad?: string;
}) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al crear usuario");
    return response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function updateUser(
  id: number,
  data: Partial<{
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: string;
    cu?: string;
    carrera?: string;
    especialidad?: string;
  }>
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    const response = await res.json();
    if (!res.ok)
      throw new Error(response.message || "Error al actualizar usuario");
    return response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function deleteUser(id: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al eliminar usuario");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function getGroups() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/grupos`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener grupos");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function createGroup(data: {
  nombre: string;
  grado: string;
  docente_id?: number;
}) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/grupos`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al crear grupo");
    return response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}
export async function deleteGroup(id: number): Promise<void> {
  const response = await fetch(`http://localhost:3000/admin/grupos/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete group");
}
export async function assignDocenteToGroup(groupId: number, docenteId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/grupos/${groupId}/asignar-docente`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docente_id: docenteId }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al asignar docente");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function assignEstudianteToGroup(
  groupId: number,
  estudianteId: number
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/grupos/${groupId}/asignar-estudiante`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudiante_id: estudianteId }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al asignar estudiante");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function getDocentes() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/docentes`,
      {
        credentials: "include",
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener docentes");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function getStudentGroups() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grupos`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener grupos");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function joinGroup(groupId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/join-group`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al unirse al grupo");
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}
