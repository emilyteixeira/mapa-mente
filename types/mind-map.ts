export type NodeShape = "rounded" | "pill" | "rectangle";
export type EdgeStyle = "curve" | "straight";
export type SyncState = "local" | "pending" | "synced" | "conflict" | "error";
export type MindMapFilter = "all" | "recent" | "favorites" | "trash";
export type MapTemplateId = "blank" | "study" | "project" | "brainstorm";

export interface MindNode {
  id: string;
  parentId: string | null;
  text: string;
  note: string;
  x: number;
  y: number;
  color: string;
  shape: NodeShape;
  collapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MindEdge {
  id: string;
  sourceId: string;
  targetId: string;
  color: string;
  style: EdgeStyle;
}

export interface MindMap {
  id: string;
  title: string;
  description: string;
  nodes: MindNode[];
  edges: MindEdge[];
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  deletedAt: string | null;
  version: number;
  syncState: SyncState;
  remoteVersion: number | null;
}

export interface AppPreferences {
  theme: "system" | "light" | "dark";
  showGrid: boolean;
  snapToGrid: boolean;
  reducedMotion: boolean;
  defaultNodeColor: string;
  canvasEdgeStyle: EdgeStyle;
}

export interface EditorHistory {
  past: MindMap[];
  future: MindMap[];
}

export interface MindMapState {
  maps: MindMap[];
  activeMapId: string | null;
  selectedNodeId: string | null;
  filter: MindMapFilter;
  searchQuery: string;
  preferences: AppPreferences;
  history: EditorHistory;
  isHydrated: boolean;
  lastSavedAt: string | null;
}

export interface PersistedMindMapState {
  schemaVersion: 1;
  maps: MindMap[];
  activeMapId: string | null;
  preferences: AppPreferences;
  lastSavedAt: string;
}
