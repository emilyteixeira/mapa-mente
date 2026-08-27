export interface FirebasePublicConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function readFirebaseConfig(env: Record<string, string | undefined> = process.env): FirebasePublicConfig | null {
  const config: FirebasePublicConfig = {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "",
    storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "",
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? "",
  };
  return Object.values(config).every(Boolean) ? config : null;
}

export const firebasePublicConfig = readFirebaseConfig({
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
export const isFirebaseConfigured = firebasePublicConfig !== null;
