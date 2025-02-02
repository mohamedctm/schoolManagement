import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

export function requireAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login"); // Redirect to login if not authenticated
      }
    };

    checkAuth();
  }, [router]);
}
