import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useReducer, useRef } from "react";

import { mindMapReducer, initialMindMapState, selectVisibleMaps, type MindMapAction } from "@/lib/mind-map/reducer";
import { loadMindMapState, saveMindMapState } from "@/lib/mind-map/storage";
import type { MindMap, MindMapState } from "@/types/mind-map";

interface MindMapContextValue {
  state: MindMapState;
  activeMap: MindMap | null;
  visibleMaps: MindMap[];
  canUndo: boolean;
  canRedo: boolean;
  dispatch: React.Dispatch<MindMapAction>;
}

const MindMapContext = createContext<MindMapContextValue | null>(null);

export function MindMapProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(mindMapReducer, initialMindMapState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    loadMindMapState().then((stored) => {
      if (!mounted) return;
      dispatch({
        type: "HYDRATE",
        maps: stored?.maps ?? [],
        activeMapId: stored?.activeMapId ?? null,
        preferences: stored?.preferences ?? initialMindMapState.preferences,
        lastSavedAt: stored?.lastSavedAt ?? null,
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.isHydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveMindMapState({ maps: state.maps, activeMapId: state.activeMapId, preferences: state.preferences })
        .then((savedAt) => dispatch({ type: "MARK_SAVED", savedAt }))
        .catch(() => undefined);
    }, 350);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state.maps, state.activeMapId, state.preferences, state.isHydrated]);

  const value = useMemo<MindMapContextValue>(() => ({
    state,
    activeMap: state.maps.find((map) => map.id === state.activeMapId) ?? null,
    visibleMaps: selectVisibleMaps(state),
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    dispatch,
  }), [state]);

  return <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>;
}

export function useMindMaps(): MindMapContextValue {
  const context = useContext(MindMapContext);
  if (!context) throw new Error("useMindMaps deve ser usado dentro de MindMapProvider");
  return context;
}
