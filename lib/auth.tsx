"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";

import { firebaseConfigured, maybeAuth } from "./firebase";
import { establishSessionFromUser } from "./sessionClient";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

async function primeUserToken(user: User | null): Promise<User | null> {
  if (!user) {
    return null;
  }

  try {
    await establishSessionFromUser(user);
  } catch {
    // Allow the app to continue with the current session object even if
    // session bootstrap is still settling in the background.
  }

  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured && !!maybeAuth);

  useEffect(() => {
    if (!firebaseConfigured || !maybeAuth) {
      return;
    }

    let cancelled = false;
    let revision = 0;

    // Wait for the token-aware auth event so API calls do not start while
    // Firebase is still settling the usable session token after hydration.
    const unsub = onIdTokenChanged(maybeAuth, (u) => {
      const currentRevision = ++revision;

      void (async () => {
        const primedUser = await primeUserToken(u);
        if (cancelled || currentRevision !== revision) {
          return;
        }

        setUser(primedUser);
        setLoading(false);
      })();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
