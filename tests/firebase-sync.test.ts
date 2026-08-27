import { describe, expect, it } from "vitest";

import { createMindMap } from "@/lib/mind-map/domain";
import { mergeLocalAndRemote } from "@/lib/firebase/sync";

describe("sincronização conservadora", () => {
  it("agenda upload para mapas que existem apenas localmente", () => {
    const local = createMindMap("Local");
    const result = mergeLocalAndRemote([local], []);
    expect(result.uploadIds.has(local.id)).toBe(true);
    expect(result.conflicts).toBe(0);
  });

  it("baixa mapas que existem apenas na nuvem", () => {
    const remote = { ...createMindMap("Nuvem"), syncState: "synced" as const };
    const result = mergeLocalAndRemote([], [remote]);
    expect(result.maps[0]).toMatchObject({ id: remote.id, syncState: "synced" });
    expect(result.uploadIds.size).toBe(0);
  });

  it("preserva duas versões quando local e nuvem mudaram desde a última base", () => {
    const original = createMindMap("Pesquisa");
    const local = { ...original, version: 4, remoteVersion: 2, syncState: "pending" as const };
    const remote = { ...original, version: 3, remoteVersion: 3, syncState: "synced" as const, updatedAt: new Date(Date.now() + 1_000).toISOString() };
    const result = mergeLocalAndRemote([local], [remote]);
    expect(result.conflicts).toBe(1);
    expect(result.maps).toHaveLength(2);
    expect(result.maps.every((map) => map.syncState === "conflict")).toBe(true);
  });
});
