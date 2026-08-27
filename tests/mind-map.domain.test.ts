import { describe, expect, it } from "vitest";

import { addChildNode, createMindMap, deleteNode, duplicateMap, isValidMindMap, moveNode, updateNode } from "@/lib/mind-map/domain";
import { initialMindMapState, mindMapReducer } from "@/lib/mind-map/reducer";

describe("domínio de mapas mentais", () => {
  it("cria um mapa válido com exatamente um nó raiz", () => {
    const map = createMindMap("Aprendizado", "study");
    expect(isValidMindMap(map)).toBe(true);
    expect(map.nodes.filter((node) => node.parentId === null)).toHaveLength(1);
    expect(map.nodes.length).toBeGreaterThan(1);
  });

  it("adiciona, atualiza e move um tópico", () => {
    const initial = createMindMap("Projeto");
    const root = initial.nodes[0];
    const result = addChildNode(initial, root.id, "Pesquisa");
    const updated = updateNode(result.map, result.nodeId, { text: "Pesquisa de usuários" });
    const moved = moveNode(updated, result.nodeId, 920, 320);
    expect(moved.nodes.find((node) => node.id === result.nodeId)).toMatchObject({ text: "Pesquisa de usuários", x: 920, y: 320 });
    expect(isValidMindMap(moved)).toBe(true);
  });

  it("permite o estado vazio intermediário ao substituir um título controlado", () => {
    const initial = createMindMap("Edição");
    const root = initial.nodes[0];
    const cleared = updateNode(initial, root.id, { text: "" });
    const replaced = updateNode(cleared, root.id, { text: "Novo título" });
    expect(cleared.nodes[0].text).toBe("");
    expect(replaced.nodes[0].text).toBe("Novo título");
  });

  it("remove descendentes sem permitir excluir o nó raiz", () => {
    const initial = createMindMap("Projeto");
    const root = initial.nodes[0];
    const child = addChildNode(initial, root.id, "Filho");
    const grandchild = addChildNode(child.map, child.nodeId, "Neto");
    expect(deleteNode(grandchild.map, root.id)).toBe(grandchild.map);
    expect(deleteNode(grandchild.map, child.nodeId).nodes).toHaveLength(1);
  });

  it("duplica um mapa com identificadores independentes", () => {
    const map = createMindMap("Plano", "project");
    const copy = duplicateMap(map);
    expect(copy.id).not.toBe(map.id);
    expect(copy.nodes.map((node) => node.id)).not.toEqual(map.nodes.map((node) => node.id));
    expect(isValidMindMap(copy)).toBe(true);
  });

  it("desfaz e refaz uma alteração estrutural", () => {
    let state = mindMapReducer(initialMindMapState, {
      type: "HYDRATE",
      maps: [],
      activeMapId: null,
      preferences: initialMindMapState.preferences,
      lastSavedAt: null,
    });
    state = mindMapReducer(state, { type: "CREATE_MAP", title: "Tese", template: "blank" });
    const rootId = state.maps[0].nodes[0].id;
    state = mindMapReducer(state, { type: "ADD_NODE", parentId: rootId });
    expect(state.maps[0].nodes).toHaveLength(2);
    state = mindMapReducer(state, { type: "UNDO" });
    expect(state.maps[0].nodes).toHaveLength(1);
    state = mindMapReducer(state, { type: "REDO" });
    expect(state.maps[0].nodes).toHaveLength(2);
  });
});
