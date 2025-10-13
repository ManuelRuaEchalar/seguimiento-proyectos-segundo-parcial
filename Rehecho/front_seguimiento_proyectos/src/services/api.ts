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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/grupos/${id}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
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

export async function getDocenteWithGroups() {
  try {
    // Get current user first to know which docente we are
    const userResponse = await getUser();
    console.log("User response:", userResponse);

    if (!userResponse.user) {
      throw new Error("Usuario no encontrado");
    }

    // Check if user is a docente
    if (userResponse.user.rol !== "docente") {
      throw new Error("Usuario no es docente");
    }

    // For docentes, the user.id is the docente ID
    const docenteId = userResponse.user.id;
    console.log("User docente ID:", docenteId);

    // Get all docentes from the endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docente`, {
      credentials: "include",
    });
    const docentesData = await res.json();
    if (!res.ok)
      throw new Error(docentesData.message || "Error al obtener docentes");

    console.log("Docentes data:", docentesData);

    // Find the current docente by ID
    const currentDocente = docentesData.find((docente: any) => {
      console.log(
        `Comparing docente ID ${
          docente.id
        } (type: ${typeof docente.id}) with user ID ${docenteId} (type: ${typeof docenteId})`
      );
      return Number(docente.id) === Number(docenteId);
    });

    console.log("Current docente found:", currentDocente);

    if (!currentDocente) {
      throw new Error("Docente no encontrado");
    }

    // If the docente has no groups, return docente info with empty groups
    if (!currentDocente.grupos || currentDocente.grupos.length === 0) {
      console.log("Docente has no groups");
      return {
        docente: currentDocente,
        groups: [],
      };
    }

    console.log("Docente groups:", currentDocente.grupos);

    // Get detailed group information for each group ID
    const groupDetails = await Promise.all(
      currentDocente.grupos.map(async (grupo: { id: number }) => {
        try {
          const groupRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/grupos`,
            {
              credentials: "include",
            }
          );
          const allGroups = await groupRes.json();
          if (!groupRes.ok)
            throw new Error("Error al obtener detalles del grupo");

          // Find the specific group by ID
          const groupDetail = allGroups.find((g: any) => g.id === grupo.id);
          console.log(`Group detail for ID ${grupo.id}:`, groupDetail);
          return groupDetail;
        } catch (err) {
          console.error(
            `Error obteniendo detalles del grupo ${grupo.id}:`,
            err
          );
          return null;
        }
      })
    );

    console.log("Final group details:", groupDetails);

    // Filter out any null values (failed requests)
    const validGroups = groupDetails.filter((group) => group !== null);

    return {
      docente: currentDocente,
      groups: validGroups,
    };
  } catch (err) {
    console.error("Error in getDocenteWithGroups:", err);
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

export async function getStudentProfile() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estudiante/me`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Error al obtener perfil del estudiante");
    }
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function createProyecto(titulo: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proyecto/crear`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ titulo }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Error al crear proyecto");
    }
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function asignarProyecto(proyectoId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/estudiante/asignar-proyecto/${proyectoId}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Error al asignar proyecto");
    }
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}

export async function obtenerProyecto() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estudiante/proyecto`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Error al obtener proyecto");
    }
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Error de conexión con el servidor");
    }
    throw new Error("Error de conexión con el servidor");
  }
}