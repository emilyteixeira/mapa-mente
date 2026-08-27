import type {
  AppPreferences,
  MapTemplateId,
  MindEdge,
  MindMap,
  MindNode,
  NodeShape,
} from "@/types/mind-map";

export const NODE_COLORS = ["#5B5CE2", "#E76F51", "#E9A23B", "#2E9B73", "#3E8ED0", "#A45CC7"] as const;

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: "system",
  showGrid: true,
  snapToGrid: false,
  reducedMotion: false,
  defaultNodeColor: NODE_COLORS[0],
  canvasEdgeStyle: "curve",
};

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function createNode(
  text: string,
  x: number,
  y: number,
  color: string,
  parentId: string | null,
  shape: NodeShape = "rounded",
): MindNode {
  const timestamp = now();
  return {
    id: createId("node"),
    parentId,
    text,
    note: "",
    x,
    y,
    color,
    shape,
    collapsed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createEdge(sourceId: string, targetId: string, color: string): MindEdge {
  return {
    id: createId("edge"),
    sourceId,
    targetId,
    color,
    style: "curve",
  };
}

function branch(root: MindNode, text: string, x: number, y: number, color: string): { node: MindNode; edge: MindEdge } {
  const node = createNode(text, x, y, color, root.id, "rounded");
  return { node, edge: createEdge(root.id, node.id, color) };
}

export function createMindMap(title: string, template: MapTemplateId = "blank"): MindMap {
  const timestamp = now();
  const root = createNode(title.trim() || "Minha ideia", 620, 420, NODE_COLORS[0], null, "pill");
  const nodes: MindNode[] = [root];
  const edges: MindEdge[] = [];

  const templateBranches: Record<Exclude<MapTemplateId, "blank">, Array<[string, number, number, string]>> = {
    study: [
      ["Conceitos-chave", 900, 260, NODE_COLORS[1]],
      ["Exemplos", 900, 420, NODE_COLORS[3]],
      ["Revisão", 900, 580, NODE_COLORS[4]],
      ["Dúvidas", 340, 420, NODE_COLORS[2]],
    ],
    project: [
      ["Objetivo", 900, 240, NODE_COLORS[3]],
      ["Entregas", 900, 400, NODE_COLORS[4]],
      ["Próximos passos", 900, 560, NODE_COLORS[1]],
      ["Riscos", 340, 320, NODE_COLORS[2]],
      ["Pessoas", 340, 520, NODE_COLORS[5]],
    ],
    brainstorm: [
      ["Ideia 1", 900, 240, NODE_COLORS[1]],
      ["Ideia 2", 900, 420, NODE_COLORS[2]],
      ["Ideia 3", 900, 600, NODE_COLORS[3]],
      ["Perguntas", 340, 300, NODE_COLORS[4]],
      ["Conexões", 340, 540, NODE_COLORS[5]],
    ],
  };

  if (template !== "blank") {
    templateBranches[template].forEach(([text, x, y, color]) => {
      const item = branch(root, text, x, y, color);
      nodes.push(item.node);
      edges.push(item.edge);
    });
  }

  return {
    id: createId("map"),
    title: title.trim() || "Mapa sem título",
    description: "",
    nodes,
    edges,
    tags: [],
    favorite: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    deletedAt: null,
    version: 1,
    syncState: "local",
    remoteVersion: null,
  };
}

function touchMap(map: MindMap): MindMap {
  return {
    ...map,
    updatedAt: now(),
    version: map.version + 1,
    syncState: map.syncState === "synced" ? "pending" : map.syncState,
  };
}

export function addChildNode(map: MindMap, parentId: string, text = "Novo tópico"): { map: MindMap; nodeId: string } {
  const parent = map.nodes.find((node) => node.id === parentId);
  if (!parent) return { map, nodeId: parentId };

  const siblings = map.nodes.filter((node) => node.parentId === parentId);
  const direction = siblings.length % 2 === 0 ? 1 : -1;
  const levelOffset = 250;
  const verticalOffset = Math.ceil((siblings.length + 1) / 2) * 120 * direction;
  const color = NODE_COLORS[(map.nodes.length + 1) % NODE_COLORS.length];
  const node = createNode(text, parent.x + levelOffset, parent.y + verticalOffset, color, parent.id);
  const edge = createEdge(parent.id, node.id, color);
  return {
    map: touchMap({ ...map, nodes: [...map.nodes, node], edges: [...map.edges, edge] }),
    nodeId: node.id,
  };
}

export function updateNode(map: MindMap, nodeId: string, changes: Partial<Pick<MindNode, "text" | "note" | "color" | "shape" | "collapsed">>): MindMap {
  let changed = false;
  const timestamp = now();
  const nodes = map.nodes.map((node) => {
    if (node.id !== nodeId) return node;
    changed = true;
    return { ...node, ...changes, text: changes.text !== undefined ? changes.text : node.text, updatedAt: timestamp };
  });
  return changed ? touchMap({ ...map, nodes }) : map;
}

export function moveNode(map: MindMap, nodeId: string, x: number, y: number): MindMap {
  let changed = false;
  const timestamp = now();
  const nodes = map.nodes.map((node) => {
    if (node.id !== nodeId || (node.x === x && node.y === y)) return node;
    changed = true;
    return { ...node, x, y, updatedAt: timestamp };
  });
  return changed ? touchMap({ ...map, nodes }) : map;
}

export function deleteNode(map: MindMap, nodeId: string): MindMap {
  const root = map.nodes.find((node) => node.parentId === null);
  if (!root || root.id === nodeId) return map;

  const descendants = new Set<string>([nodeId]);
  let discovered = true;
  while (discovered) {
    discovered = false;
    map.nodes.forEach((node) => {
      if (node.parentId && descendants.has(node.parentId) && !descendants.has(node.id)) {
        descendants.add(node.id);
        discovered = true;
      }
    });
  }

  const nodes = map.nodes.filter((node) => !descendants.has(node.id));
  const edges = map.edges.filter((edge) => !descendants.has(edge.sourceId) && !descendants.has(edge.targetId));
  return touchMap({ ...map, nodes, edges });
}

export function duplicateMap(map: MindMap): MindMap {
  const timestamp = now();
  const nodeIdMap = new Map(map.nodes.map((node) => [node.id, createId("node")]));
  const nodes = map.nodes.map((node) => ({
    ...node,
    id: nodeIdMap.get(node.id)!,
    parentId: node.parentId ? nodeIdMap.get(node.parentId) ?? null : null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
  const edges = map.edges.map((edge) => ({
    ...edge,
    id: createId("edge"),
    sourceId: nodeIdMap.get(edge.sourceId)!,
    targetId: nodeIdMap.get(edge.targetId)!,
  }));
  return {
    ...map,
    id: createId("map"),
    title: `${map.title} — cópia`,
    nodes,
    edges,
    favorite: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    deletedAt: null,
    version: 1,
    syncState: "local",
    remoteVersion: null,
  };
}

export function getMapRoot(map: MindMap): MindNode | undefined {
  return map.nodes.find((node) => node.parentId === null);
}

export function isValidMindMap(map: MindMap): boolean {
  const nodeIds = new Set(map.nodes.map((node) => node.id));
  const roots = map.nodes.filter((node) => node.parentId === null);
  return (
    roots.length === 1 &&
    map.nodes.every((node) => node.parentId === null || nodeIds.has(node.parentId)) &&
    map.edges.every((edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId) && edge.sourceId !== edge.targetId)
  );
}
