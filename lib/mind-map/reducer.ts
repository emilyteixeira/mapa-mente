import {
  addChildNode,
  createMindMap,
  DEFAULT_PREFERENCES,
  deleteNode,
  duplicateMap,
  moveNode,
  updateNode,
} from "@/lib/mind-map/domain";
import type { AppPreferences, MapTemplateId, MindMap, MindMapFilter, MindMapState, MindNode } from "@/types/mind-map";

const HISTORY_LIMIT = 40;

export const initialMindMapState: MindMapState = {
  maps: [],
  activeMapId: null,
  selectedNodeId: null,
  filter: "all",
  searchQuery: "",
  preferences: DEFAULT_PREFERENCES,
  history: { past: [], future: [] },
  isHydrated: false,
  lastSavedAt: null,
};

export type MindMapAction =
  | { type: "HYDRATE"; maps: MindMap[]; activeMapId: string | null; preferences: AppPreferences; lastSavedAt: string | null }
  | { type: "CREATE_MAP"; title: string; template: MapTemplateId }
  | { type: "OPEN_MAP"; mapId: string }
  | { type: "CLOSE_MAP" }
  | { type: "SELECT_NODE"; nodeId: string | null }
  | { type: "ADD_NODE"; parentId: string }
  | { type: "UPDATE_NODE"; nodeId: string; changes: Partial<Pick<MindNode, "text" | "note" | "color" | "shape" | "collapsed">> }
  | { type: "MOVE_NODE"; nodeId: string; x: number; y: number; recordHistory?: boolean }
  | { type: "DELETE_NODE"; nodeId: string }
  | { type: "UPDATE_MAP_META"; mapId: string; changes: Partial<Pick<MindMap, "title" | "description" | "tags">> }
  | { type: "TOGGLE_FAVORITE"; mapId: string }
  | { type: "DUPLICATE_MAP"; mapId: string }
  | { type: "MOVE_TO_TRASH"; mapId: string }
  | { type: "RESTORE_MAP"; mapId: string }
  | { type: "DELETE_FOREVER"; mapId: string }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_FILTER"; filter: MindMapFilter }
  | { type: "SET_PREFERENCES"; changes: Partial<AppPreferences> }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED"; savedAt: string }
  | { type: "SYNC_MERGE"; maps: MindMap[] }
  | { type: "REPLACE_MAP"; map: MindMap; recordHistory?: boolean };

function getActiveMap(state: MindMapState): MindMap | undefined {
  return state.maps.find((map) => map.id === state.activeMapId);
}

function replaceMap(state: MindMapState, previous: MindMap, next: MindMap, recordHistory = true): MindMapState {
  if (previous === next) return state;
  const past = recordHistory ? [...state.history.past, previous].slice(-HISTORY_LIMIT) : state.history.past;
  return {
    ...state,
    maps: state.maps.map((map) => (map.id === next.id ? next : map)),
    history: recordHistory ? { past, future: [] } : state.history,
  };
}

export function mindMapReducer(state: MindMapState, action: MindMapAction): MindMapState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        maps: action.maps,
        activeMapId: action.activeMapId && action.maps.some((map) => map.id === action.activeMapId) ? action.activeMapId : null,
        preferences: { ...DEFAULT_PREFERENCES, ...action.preferences },
        isHydrated: true,
        lastSavedAt: action.lastSavedAt,
      };
    case "CREATE_MAP": {
      const map = createMindMap(action.title, action.template);
      return { ...state, maps: [map, ...state.maps], activeMapId: map.id, selectedNodeId: map.nodes[0]?.id ?? null, history: { past: [], future: [] } };
    }
    case "OPEN_MAP": {
      const timestamp = new Date().toISOString();
      return {
        ...state,
        activeMapId: action.mapId,
        selectedNodeId: null,
        history: { past: [], future: [] },
        maps: state.maps.map((map) => (map.id === action.mapId ? { ...map, lastOpenedAt: timestamp } : map)),
      };
    }
    case "CLOSE_MAP":
      return { ...state, activeMapId: null, selectedNodeId: null, history: { past: [], future: [] } };
    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.nodeId };
    case "ADD_NODE": {
      const map = getActiveMap(state);
      if (!map) return state;
      const result = addChildNode(map, action.parentId);
      return { ...replaceMap(state, map, result.map), selectedNodeId: result.nodeId };
    }
    case "UPDATE_NODE": {
      const map = getActiveMap(state);
      return map ? replaceMap(state, map, updateNode(map, action.nodeId, action.changes)) : state;
    }
    case "MOVE_NODE": {
      const map = getActiveMap(state);
      return map ? replaceMap(state, map, moveNode(map, action.nodeId, action.x, action.y), action.recordHistory !== false) : state;
    }
    case "DELETE_NODE": {
      const map = getActiveMap(state);
      if (!map) return state;
      const next = deleteNode(map, action.nodeId);
      return { ...replaceMap(state, map, next), selectedNodeId: next === map ? state.selectedNodeId : null };
    }
    case "UPDATE_MAP_META": {
      const timestamp = new Date().toISOString();
      return {
        ...state,
        maps: state.maps.map((map) =>
          map.id === action.mapId
            ? { ...map, ...action.changes, title: action.changes.title !== undefined ? action.changes.title : map.title, updatedAt: timestamp, version: map.version + 1, syncState: map.syncState === "synced" ? "pending" : map.syncState }
            : map,
        ),
      };
    }
    case "TOGGLE_FAVORITE":
      return { ...state, maps: state.maps.map((map) => (map.id === action.mapId ? { ...map, favorite: !map.favorite, updatedAt: new Date().toISOString() } : map)) };
    case "DUPLICATE_MAP": {
      const source = state.maps.find((map) => map.id === action.mapId);
      return source ? { ...state, maps: [duplicateMap(source), ...state.maps] } : state;
    }
    case "MOVE_TO_TRASH":
      return { ...state, maps: state.maps.map((map) => (map.id === action.mapId ? { ...map, deletedAt: new Date().toISOString(), syncState: "pending" } : map)) };
    case "RESTORE_MAP":
      return { ...state, maps: state.maps.map((map) => (map.id === action.mapId ? { ...map, deletedAt: null, updatedAt: new Date().toISOString(), syncState: "pending" } : map)) };
    case "DELETE_FOREVER":
      return { ...state, maps: state.maps.filter((map) => map.id !== action.mapId), activeMapId: state.activeMapId === action.mapId ? null : state.activeMapId };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "SET_PREFERENCES":
      return { ...state, preferences: { ...state.preferences, ...action.changes } };
    case "UNDO": {
      const map = getActiveMap(state);
      const previous = state.history.past.at(-1);
      if (!map || !previous) return state;
      return {
        ...state,
        maps: state.maps.map((item) => (item.id === map.id ? previous : item)),
        selectedNodeId: null,
        history: { past: state.history.past.slice(0, -1), future: [map, ...state.history.future].slice(0, HISTORY_LIMIT) },
      };
    }
    case "REDO": {
      const map = getActiveMap(state);
      const next = state.history.future[0];
      if (!map || !next) return state;
      return {
        ...state,
        maps: state.maps.map((item) => (item.id === map.id ? next : item)),
        selectedNodeId: null,
        history: { past: [...state.history.past, map].slice(-HISTORY_LIMIT), future: state.history.future.slice(1) },
      };
    }
    case "MARK_SAVED":
      return { ...state, lastSavedAt: action.savedAt };
    case "SYNC_MERGE":
      return {
        ...state,
        maps: action.maps,
        activeMapId: state.activeMapId && action.maps.some((map) => map.id === state.activeMapId) ? state.activeMapId : null,
        selectedNodeId: null,
        history: { past: [], future: [] },
      };
    case "REPLACE_MAP": {
      const previous = state.maps.find((map) => map.id === action.map.id);
      if (!previous) return { ...state, maps: [action.map, ...state.maps] };
      return replaceMap(state, previous, action.map, action.recordHistory ?? false);
    }
    default:
      return state;
  }
}

export function selectVisibleMaps(state: MindMapState): MindMap[] {
  const normalizedQuery = state.searchQuery.trim().toLocaleLowerCase("pt-BR");
  return state.maps
    .filter((map) => {
      if (state.filter === "trash") return Boolean(map.deletedAt);
      if (map.deletedAt) return false;
      if (state.filter === "favorites" && !map.favorite) return false;
      return true;
    })
    .filter((map) => !normalizedQuery || [map.title, map.description, ...map.tags].join(" ").toLocaleLowerCase("pt-BR").includes(normalizedQuery))
    .sort((a, b) => {
      if (state.filter === "recent") return Date.parse(b.lastOpenedAt) - Date.parse(a.lastOpenedAt);
      return Number(b.favorite) - Number(a.favorite) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    });
}
