import { describe, expect, it } from "vitest";

import { readFirebaseConfig } from "@/lib/firebase/config";

describe("configuração Firebase", () => {
  it("mantém o modo local quando a configuração foi recusada ou está incompleta", () => {
    expect(readFirebaseConfig({})).toBeNull();
    expect(readFirebaseConfig({ EXPO_PUBLIC_FIREBASE_API_KEY: "chave" })).toBeNull();
  });

  it("aceita somente o conjunto público completo de configuração", () => {
    const config = readFirebaseConfig({
      EXPO_PUBLIC_FIREBASE_API_KEY: "api-key",
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "mapamente.firebaseapp.com",
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: "mapamente",
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: "mapamente.firebasestorage.app",
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
      EXPO_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef",
    });
    expect(config).toMatchObject({ projectId: "mapamente", authDomain: "mapamente.firebaseapp.com" });
  });
});

