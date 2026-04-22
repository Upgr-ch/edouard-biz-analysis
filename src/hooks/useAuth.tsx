import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const refreshSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        setUser(refreshedSession?.user ?? session.user);
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    refreshSession();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}
