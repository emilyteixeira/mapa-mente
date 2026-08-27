import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_PREFERENCES, isValidMindMap } from "@/lib/mind-map/domain";
import type { PersistedMindMapState } from "@/types/mind-map";

const STORAGE_KEY = "@mapamente/library:v1";

export async function loadMindMapState(): Promise<PersistedMindMapState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedMindMapState>;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.maps)) return null;
    return {
      schemaVersion: 1,
      maps: parsed.maps.filter(isValidMindMap),
      activeMapId: typeof parsed.activeMapId === "string" ? parsed.activeMapId : null,
      preferences: { ...DEFAULT_PREFERENCES, ...parsed.preferences },
      lastSavedAt: parsed.lastSavedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveMindMapState(state: Omit<PersistedMindMapState, "schemaVersion" | "lastSavedAt">): Promise<string> {
  const lastSavedAt = new Date().toISOString();
  const payload: PersistedMindMapState = { schemaVersion: 1, ...state, lastSavedAt };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return lastSavedAt;
}

export async function clearMindMapState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
