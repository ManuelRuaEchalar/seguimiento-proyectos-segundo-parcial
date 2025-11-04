import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/api";
import { User } from "@/types";

export function useAuthGuard(expectedRole: string) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyAccess() {
      try {
        const data = await getUser();
        if (!data.user || data.user.rol !== expectedRole) {
          setIsUnauthorized(true);
          router.push("/auth/login");
          return;
        }
        setUser(data.user);
        setIsLoading(false);
      } catch (err) {
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message || "Error de autenticación"
            : "Error de autenticación"
        );
        setIsUnauthorized(true);
        router.push("/auth/login");
        setIsLoading(false);
      }
    }
    verifyAccess();
  }, [router, expectedRole]);

  return { user, isLoading, isUnauthorized, error };
}
