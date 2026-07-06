import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UseAuthReturn {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Custom hook for authentication state management.
 * Handles session persistence and auth state changes.
 */
export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Register listener first
      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        if (mounted) {
          setSession(sess);
          setUser(sess?.user ?? null);
        }
      });

      // Hydrate existing session
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      }

      return () => {
        sub.subscription.unsubscribe();
      };
    };

    const cleanup = initAuth();

    return () => {
      mounted = false;
      cleanup.then((fn) => fn?.());
    };
  }, []);

  return {
    session,
    user,
    loading,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  };
}
