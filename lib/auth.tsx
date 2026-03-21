"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";

import { firebaseConfigured, maybeAuth } from "./firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured && !!maybeAuth);

  useEffect(() => {
    if (!firebaseConfigured || !maybeAuth) {
      return;
    }

    // Wait for the token-aware auth event so API calls do not start while
    // Firebase is still settling the usable session token after hydration.
    const unsub = onIdTokenChanged(maybeAuth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
