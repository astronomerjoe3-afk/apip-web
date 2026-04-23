"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { User } from "firebase/auth";

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

const PUBLIC_MARKETING_PATHS = new Set([
  "/",
  "/graph-lab",
  "/learn",
  "/mission-demo",
  "/support",
  "/privacy",
  "/terms",
  "/delete-account",
  "/delete-account/request",
]);

const ANONYMOUS_SESSION_PROBE_SKIP_PATHS = new Set([
  ...PUBLIC_MARKETING_PATHS,
  "/login",
  "/register",
]);

function shouldSkipAuthBootstrap(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }

  return PUBLIC_MARKETING_PATHS.has(pathname);
}

function shouldSkipAnonymousSessionProbe(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }

  return ANONYMOUS_SESSION_PROBE_SKIP_PATHS.has(pathname);
}

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
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const skipAuthBootstrap = shouldSkipAuthBootstrap(pathname);
    const skipAnonymousSessionProbe = shouldSkipAnonymousSessionProbe(pathname);

    if (skipAuthBootstrap) {
      setUser(null);
      setSessionUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    let cancelled = false;
    let revision = 0;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const [{ onIdTokenChanged }, firebaseModule] = await Promise.all([
        import("firebase/auth"),
        import("./firebase"),
      ]);

      if (cancelled) {
        return;
      }

      if (!firebaseModule.firebaseConfigured || !firebaseModule.maybeAuth) {
        if (skipAnonymousSessionProbe) {
          setUser(null);
          setSessionUser(null);
          setLoading(false);
          return;
        }

        const fallbackSessionUser = await readSessionUserSafe();
        if (cancelled) {
          return;
        }

        setUser(null);
        setSessionUser(fallbackSessionUser);
        setLoading(false);
        return;
      }

      // Wait for the token-aware auth event so API calls do not start while
      // Firebase is still settling the usable session token after hydration.
      unsubscribe = onIdTokenChanged(firebaseModule.maybeAuth, (u) => {
        const currentRevision = ++revision;

        void (async () => {
          if (!u && skipAnonymousSessionProbe) {
            if (cancelled || currentRevision !== revision) {
              return;
            }

            setUser(null);
            setSessionUser(null);
            setLoading(false);
            return;
          }

          const primedState = await primeUserToken(u);
          if (cancelled || currentRevision !== revision) {
            return;
          }

          setUser(primedState.user);
          setSessionUser(primedState.sessionUser);
          setLoading(false);
        })();
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [pathname]);

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
