import { createId, isValidMindMap } from "@/lib/mind-map/domain";
import { firebasePublicConfig } from "@/lib/firebase/config";
import type { MindMap } from "@/types/mind-map";

interface MergeResult {
  maps: MindMap[];
  uploadIds: Set<string>;
  conflicts: number;
}

function cloudCopy(remote: MindMap, titleSuffix = ""): MindMap {
  return {
    ...remote,
    id: titleSuffix ? createId("map") : remote.id,
    title: titleSuffix ? `${remote.title} ${titleSuffix}` : remote.title,
    syncState: titleSuffix ? "conflict" : "synced",
    remoteVersion: remote.version,
  };
}

export function mergeLocalAndRemote(localMaps: MindMap[], remoteMaps: MindMap[]): MergeResult {
  const remoteById = new Map(remoteMaps.map((map) => [map.id, map]));
  const maps: MindMap[] = [];
  const uploadIds = new Set<string>();
  let conflicts = 0;

  localMaps.forEach((local) => {
    const remote = remoteById.get(local.id);
    if (!remote) {
      maps.push(local);
      uploadIds.add(local.id);
      return;
    }
    remoteById.delete(local.id);

    const localChanged = ["local", "pending", "error"].includes(local.syncState);
    const remoteChangedSinceBase = local.remoteVersion !== null && remote.version !== local.remoteVersion;
    if (localChanged && remoteChangedSinceBase) {
      conflicts += 1;
      maps.push({ ...local, syncState: "conflict" }, cloudCopy(remote, "— versão da nuvem"));
      return;
    }

    if (!localChanged && Date.parse(remote.updatedAt) > Date.parse(local.updatedAt)) {
      maps.push(cloudCopy(remote));
      return;
    }

    maps.push(local);
    uploadIds.add(local.id);
  });

  remoteById.forEach((remote) => maps.push(cloudCopy(remote)));
  return { maps, uploadIds, conflicts };
}

function parseRemoteMap(id: string, payload: string): MindMap | null {
  let data: unknown;
  try { data = JSON.parse(payload); } catch { return null; }
  if (!data || typeof data !== "object") return null;
  const candidate = { ...(data as MindMap), id };
  return isValidMindMap(candidate) ? candidate : null;
}

interface FirestoreDocument {
  name: string;
  fields?: { payload?: { stringValue?: string } };
}

function requireProjectId(): string {
  if (!firebasePublicConfig) throw new Error("CONFIGURATION_NOT_FOUND");
  return firebasePublicConfig.projectId;
}

function collectionUrl(uid: string): string {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(requireProjectId())}/databases/(default)/documents/users/${encodeURIComponent(uid)}/mindMaps`;
}

async function firebaseRequest(url: string, idToken: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? `HTTP_${response.status}`);
  }
  return response;
}

async function readRemoteMaps(uid: string, idToken: string): Promise<MindMap[]> {
  const remoteMaps: MindMap[] = [];
  let pageToken = "";
  do {
    const url = `${collectionUrl(uid)}?pageSize=100${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
    const response = await firebaseRequest(url, idToken);
    const payload = await response.json() as { documents?: FirestoreDocument[]; nextPageToken?: string };
    (payload.documents ?? []).forEach((document) => {
      const id = document.name.split("/").at(-1);
      const serialized = document.fields?.payload?.stringValue;
      if (!id || !serialized) return;
      const map = parseRemoteMap(id, serialized);
      if (map) remoteMaps.push(map);
    });
    pageToken = payload.nextPageToken ?? "";
  } while (pageToken);
  return remoteMaps;
}

async function writeRemoteMap(uid: string, idToken: string, map: MindMap): Promise<void> {
  const syncedMap: MindMap = { ...map, syncState: "synced", remoteVersion: map.version };
  await firebaseRequest(`${collectionUrl(uid)}/${encodeURIComponent(map.id)}`, idToken, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        payload: { stringValue: JSON.stringify(syncedMap) },
        version: { integerValue: String(map.version) },
        updatedAt: { timestampValue: map.updatedAt },
        deleted: { booleanValue: Boolean(map.deletedAt) },
      },
    }),
  });
}

export async function syncMapsWithFirestore(uid: string, idToken: string, localMaps: MindMap[]): Promise<{ maps: MindMap[]; conflicts: number }> {
  const remoteMaps = await readRemoteMaps(uid, idToken);
  const merged = mergeLocalAndRemote(localMaps, remoteMaps);

  await Promise.all(
    merged.maps
      .filter((map) => merged.uploadIds.has(map.id))
      .map((map) => writeRemoteMap(uid, idToken, map)),
  );

  return {
    conflicts: merged.conflicts,
    maps: merged.maps.map((map) => merged.uploadIds.has(map.id) ? { ...map, syncState: "synced", remoteVersion: map.version } : map),
  };
}
