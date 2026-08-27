import AsyncStorage from "@react-native-async-storage/async-storage";

import { firebasePublicConfig } from "@/lib/firebase/config";

const SESSION_KEY = "@mapamente/firebase-session:v1";

export interface FirebaseUser {
  uid: string;
  email: string | null;
}

export interface FirebaseSession {
  user: FirebaseUser;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface IdentityResponse {
  localId: string;
  email?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

function requireConfig() {
  if (!firebasePublicConfig) throw new Error("CONFIGURATION_NOT_FOUND");
  return firebasePublicConfig;
}

async function parseFirebaseError(response: Response): Promise<never> {
  const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
  throw new Error(payload?.error?.message ?? `HTTP_${response.status}`);
}

function toSession(response: IdentityResponse): FirebaseSession {
  return {
    user: { uid: response.localId, email: response.email ?? null },
    idToken: response.idToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + Math.max(60, Number(response.expiresIn) || 3600) * 1000,
  };
}

async function identityRequest(endpoint: string, body: Record<string, unknown>): Promise<FirebaseSession> {
  const config = requireConfig();
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${encodeURIComponent(config.apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, returnSecureToken: true }),
  });
  if (!response.ok) return parseFirebaseError(response);
  const session = toSession(await response.json() as IdentityResponse);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signInWithFirebaseEmail(email: string, password: string): Promise<FirebaseSession> {
  return identityRequest("signInWithPassword", { email: email.trim(), password });
}

export function createFirebaseEmailAccount(email: string, password: string): Promise<FirebaseSession> {
  return identityRequest("signUp", { email: email.trim(), password });
}

export async function sendFirebasePasswordReset(email: string): Promise<void> {
  const config = requireConfig();
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(config.apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestType: "PASSWORD_RESET", email: email.trim() }),
  });
  if (!response.ok) return parseFirebaseError(response);
}

export async function clearFirebaseSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function restoreFirebaseSession(): Promise<FirebaseSession | null> {
  if (!firebasePublicConfig) return null;
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as FirebaseSession;
    if (stored.expiresAt > Date.now() + 60_000) return stored;
    const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(stored.refreshToken)}`;
    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(firebasePublicConfig.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      await clearFirebaseSession();
      return null;
    }
    const refreshed = await response.json() as { user_id: string; id_token: string; refresh_token: string; expires_in: string };
    const session: FirebaseSession = {
      user: { ...stored.user, uid: refreshed.user_id },
      idToken: refreshed.id_token,
      refreshToken: refreshed.refresh_token,
      expiresAt: Date.now() + Number(refreshed.expires_in || 3600) * 1000,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    await clearFirebaseSession();
    return null;
  }
}
