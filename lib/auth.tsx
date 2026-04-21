"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";

import { firebaseConfigured, maybeAuth } from "./firebase";
import { establishSessionFromUser, readSessionUser, type SessionUser } from "./sessionClient";

type AuthContextValue = {
  user: User | null;
  sessionUser: SessionUser | null;
  authenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  sessionUser: null,
  authenticated: false,
  loading: true,
});

async function readSessionUserSafe(): Promise<SessionUser | null> {
  try {
    return await readSessionUser();
  } catch {
    return null;
  }
}

async function primeUserToken(user: User | null): Promise<{
  user: User | null;
  sessionUser: SessionUser | null;
}> {
  if (!user) {
    return {
      user: null,
      sessionUser: await readSessionUserSafe(),
    };
  }

  try {
    const sessionUser = await establishSessionFromUser(user);
    return {
      user,
      sessionUser,
    };
  } catch {
    return {
      user,
      // Fall back to any existing server session so authenticated users can
      // survive WebView/Firebase rehydration quirks across app restarts.
      sessionUser: await readSessionUserSafe(),
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !maybeAuth) {
      void (async () => {
        const fallbackSessionUser = await readSessionUserSafe();
        setSessionUser(fallbackSessionUser);
        setLoading(false);
      })();
      return;
    }

    let cancelled = false;
    let revision = 0;

    // Wait for the token-aware auth event so API calls do not start while
    // Firebase is still settling the usable session token after hydration.
    const unsub = onIdTokenChanged(maybeAuth, (u) => {
      const currentRevision = ++revision;

      void (async () => {
        const primedState = await primeUserToken(u);
        if (cancelled || currentRevision !== revision) {
          return;
        }

        setUser(primedState.user);
        setSessionUser(primedState.sessionUser);
        setLoading(false);
      })();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionUser,
        authenticated: Boolean(user || sessionUser),
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
