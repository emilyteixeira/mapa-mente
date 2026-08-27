import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useMindMaps } from "@/context/mind-map-context";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { syncMapsWithFirestore } from "@/lib/firebase/sync";
import {
  clearFirebaseSession,
  createFirebaseEmailAccount,
  restoreFirebaseSession,
  sendFirebasePasswordReset,
  signInWithFirebaseEmail,
  type FirebaseSession,
  type FirebaseUser,
} from "@/lib/firebase/rest-auth";

type CloudStatus = "local" | "ready" | "syncing" | "synced" | "offline" | "conflict" | "error";

interface FirebaseSyncContextValue {
  configured: boolean;
  user: FirebaseUser | null;
  status: CloudStatus;
  error: string | null;
  lastSyncAt: string | null;
  conflicts: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  syncNow: () => Promise<void>;
}

const FirebaseSyncContext = createContext<FirebaseSyncContextValue | null>(null);

function friendlyError(error: unknown): string {
  const code = error instanceof Error ? error.message.toLocaleLowerCase() : "";
  if (code.includes("invalid_password") || code.includes("email_not_found") || code.includes("invalid_login_credentials")) return "E-mail ou senha incorretos.";
  if (code.includes("email_exists")) return "Este e-mail já possui uma conta.";
  if (code.includes("weak_password")) return "Use uma senha com pelo menos 6 caracteres.";
  if (code.includes("failed to fetch") || code.includes("network") || code.includes("unavailable")) return "Sem conexão. Seus mapas continuam salvos neste dispositivo.";
  return "Não foi possível concluir a ação agora. Tente novamente.";
}

export function FirebaseSyncProvider({ children }: PropsWithChildren) {
  const { state, dispatch } = useMindMaps();
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [status, setStatus] = useState<CloudStatus>(isFirebaseConfigured ? "ready" : "local");
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let mounted = true;
    restoreFirebaseSession().then((restored) => {
      if (!mounted) return;
      setSession(restored);
      setStatus(restored ? "ready" : "local");
    });
    return () => { mounted = false; };
  }, []);

  const syncNow = useCallback(async () => {
    if (!session) {
      setError("Entre na sua conta para sincronizar.");
      return;
    }
    setStatus("syncing");
    setError(null);
    try {
      const result = await syncMapsWithFirestore(session.user.uid, session.idToken, state.maps);
      dispatch({ type: "SYNC_MERGE", maps: result.maps });
      setConflicts(result.conflicts);
      setLastSyncAt(new Date().toISOString());
      setStatus(result.conflicts ? "conflict" : "synced");
    } catch (nextError) {
      const message = friendlyError(nextError);
      setError(message);
      setStatus(message.startsWith("Sem conexão") ? "offline" : "error");
    }
  }, [dispatch, session, state.maps]);

  const value = useMemo<FirebaseSyncContextValue>(() => ({
    configured: isFirebaseConfigured,
    user: session?.user ?? null,
    status,
    error,
    lastSyncAt,
    conflicts,
    signIn: async (email, password) => {
      if (!isFirebaseConfigured) throw new Error("Firebase não configurado");
      setError(null);
      try { const nextSession = await signInWithFirebaseEmail(email, password); setSession(nextSession); setStatus("ready"); }
      catch (nextError) { const message = friendlyError(nextError); setError(message); throw new Error(message); }
    },
    signUp: async (email, password) => {
      if (!isFirebaseConfigured) throw new Error("Firebase não configurado");
      setError(null);
      try { const nextSession = await createFirebaseEmailAccount(email, password); setSession(nextSession); setStatus("ready"); }
      catch (nextError) { const message = friendlyError(nextError); setError(message); throw new Error(message); }
    },
    signOut: async () => { await clearFirebaseSession(); setSession(null); setStatus("local"); },
    resetPassword: async (email) => {
      if (!isFirebaseConfigured) throw new Error("Firebase não configurado");
      setError(null);
      try { await sendFirebasePasswordReset(email); }
      catch (nextError) { const message = friendlyError(nextError); setError(message); throw new Error(message); }
    },
    syncNow,
  }), [conflicts, error, lastSyncAt, session, status, syncNow]);

  return <FirebaseSyncContext.Provider value={value}>{children}</FirebaseSyncContext.Provider>;
}

export function useFirebaseSync(): FirebaseSyncContextValue {
  const context = useContext(FirebaseSyncContext);
  if (!context) throw new Error("useFirebaseSync deve ser usado dentro de FirebaseSyncProvider");
  return context;
}
