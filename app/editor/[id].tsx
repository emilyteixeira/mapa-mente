import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { MindMapCanvas, type MindMapCanvasHandle } from "@/components/editor/mind-map-canvas";
import { NodeInspector } from "@/components/editor/node-inspector";
import { ScreenContainer } from "@/components/screen-container";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useMindMaps } from "@/context/mind-map-context";
import { useColors } from "@/hooks/use-colors";

export default function EditorScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { state, activeMap, canUndo, canRedo, dispatch } = useMindMaps();
  const canvasRef = useRef<MindMapCanvasHandle>(null);
  const [showOutline, setShowOutline] = useState(false);
  useEffect(() => {
    if (id !== "new" && id && state.maps.some((map) => map.id === id) && activeMap?.id !== id) dispatch({ type: "OPEN_MAP", mapId: id });
  }, [activeMap?.id, dispatch, id, state.maps]);
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "REDO" : "UNDO" });
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        canvasRef.current?.zoomIn();
      } else if (event.key === "-") {
        event.preventDefault();
        canvasRef.current?.zoomOut();
      } else if (event.key === "0") {
        event.preventDefault();
        canvasRef.current?.fit();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);
  const map = activeMap ?? state.maps[0];
  const selectedNode = useMemo(() => map?.nodes.find((node) => node.id === state.selectedNodeId) ?? null, [map?.nodes, state.selectedNodeId]);
  const root = map?.nodes.find((node) => node.parentId === null);

  const exit = () => {
    dispatch({ type: "CLOSE_MAP" });
    router.replace("/(tabs)");
  };

  const deleteSelected = () => {
    if (!selectedNode || selectedNode.parentId === null) return;
    const remove = () => dispatch({ type: "DELETE_NODE", nodeId: selectedNode.id });
    if (Platform.OS === "web") {
      if (globalThis.confirm(`Excluir “${selectedNode.text}” e suas ramificações?`)) remove();
      return;
    }
    Alert.alert("Excluir tópico?", "As ramificações ligadas a ele também serão excluídas.", [{ text: "Cancelar", style: "cancel" }, { text: "Excluir", style: "destructive", onPress: remove }]);
  };

  if (!map) {
    return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><Text className="text-foreground text-lg font-bold">Mapa não encontrado</Text><PressableScale onPress={exit} style={[styles.returnButton, { backgroundColor: colors.primary }]}><Text style={styles.returnText}>Voltar à Biblioteca</Text></PressableScale></ScreenContainer>;
  }

  const selectedOrRoot = selectedNode ?? root;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Voltar à Biblioteca" onPress={exit} style={styles.headerButton}><MaterialIcons name="arrow-back" size={24} color={colors.foreground} /></PressableScale>
        <View style={styles.titleArea}>
          <TextInput
            accessibilityLabel="Título do mapa"
            value={map.title}
            onChangeText={(title) => dispatch({ type: "UPDATE_MAP_META", mapId: map.id, changes: { title } })}
            onBlur={() => { if (!map.title.trim()) dispatch({ type: "UPDATE_MAP_META", mapId: map.id, changes: { title: "Mapa sem título" } }); }}
            returnKeyType="done"
            style={[styles.titleInput, { color: colors.foreground }]}
          />
          <View style={styles.saveRow}><View style={[styles.saveDot, { backgroundColor: map.syncState === "synced" ? colors.success : colors.warning }]} /><Text style={[styles.saveText, { color: colors.muted }]}>{map.syncState === "synced" ? "Sincronizado" : "Salvo neste dispositivo"}</Text></View>
        </View>
        <PressableScale accessibilityRole="button" accessibilityLabel="Mostrar estrutura em lista" accessibilityState={{ expanded: showOutline }} onPress={() => setShowOutline((value) => !value)} style={styles.headerButton}><MaterialIcons name="format-list-bulleted" size={24} color={showOutline ? colors.primary : colors.foreground} /></PressableScale>
        <PressableScale accessibilityRole="button" accessibilityLabel="Abrir ajuda" onPress={() => router.push("/help" as never)} style={styles.headerButton}><MaterialIcons name="help-outline" size={23} color={colors.foreground} /></PressableScale>
      </View>

      <View style={styles.editorBody}>
        <View style={styles.canvasArea}>
          <MindMapCanvas
            ref={canvasRef}
            map={map}
            selectedNodeId={state.selectedNodeId}
            showGrid={state.preferences.showGrid}
            onSelectNode={(nodeId) => dispatch({ type: "SELECT_NODE", nodeId })}
            onMoveNode={(nodeId, x, y) => {
              const snap = state.preferences.snapToGrid ? 24 : 1;
              dispatch({ type: "MOVE_NODE", nodeId, x: Math.round(x / snap) * snap, y: Math.round(y / snap) * snap });
            }}
          />

          <View style={[styles.zoomDock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <EditorIcon icon="remove" label="Diminuir zoom" onPress={() => canvasRef.current?.zoomOut()} />
            <EditorIcon icon="filter-center-focus" label="Enquadrar mapa" onPress={() => canvasRef.current?.fit()} />
            <EditorIcon icon="add" label="Aumentar zoom" onPress={() => canvasRef.current?.zoomIn()} />
          </View>

          <View style={[styles.actionDock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <EditorIcon icon="undo" label="Desfazer" disabled={!canUndo} onPress={() => dispatch({ type: "UNDO" })} />
            <EditorIcon icon="redo" label="Refazer" disabled={!canRedo} onPress={() => dispatch({ type: "REDO" })} />
            <View style={[styles.dockDivider, { backgroundColor: colors.border }]} />
            <PressableScale haptic accessibilityRole="button" accessibilityLabel="Adicionar ramificação" disabled={!selectedOrRoot} onPress={() => selectedOrRoot && dispatch({ type: "ADD_NODE", parentId: selectedOrRoot.id })} style={[styles.addTopicButton, { backgroundColor: colors.primary }]}><MaterialIcons name="add" size={22} color="#FFFFFF" /><Text style={styles.addTopicText}>Tópico</Text></PressableScale>
          </View>

          {showOutline ? (
            <View style={[styles.outline, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.outlineHeader}><View><Text style={[styles.outlineEyebrow, { color: colors.primary }]}>ESTRUTURA ACESSÍVEL</Text><Text style={[styles.outlineTitle, { color: colors.foreground }]}>Tópicos</Text></View><PressableScale onPress={() => setShowOutline(false)} style={styles.headerButton}><MaterialIcons name="close" size={22} color={colors.muted} /></PressableScale></View>
              <FlatList data={map.nodes} keyExtractor={(node) => node.id} renderItem={({ item }) => <PressableScale accessibilityRole="button" onPress={() => { dispatch({ type: "SELECT_NODE", nodeId: item.id }); setShowOutline(false); }} style={[styles.outlineItem, { borderColor: colors.border }]}><View style={[styles.outlineDot, { backgroundColor: item.color }]} /><View style={styles.outlineText}><Text style={[styles.outlineItemTitle, { color: colors.foreground }]}>{item.text}</Text><Text style={[styles.outlineItemMeta, { color: colors.muted }]}>{item.parentId ? "Tópico" : "Ideia central"}</Text></View><MaterialIcons name="chevron-right" size={22} color={colors.muted} /></PressableScale>} />
            </View>
          ) : null}
        </View>

        {selectedNode && width >= 900 ? (
          <NodeInspector node={selectedNode} isRoot={selectedNode.parentId === null} sidePanel onClose={() => dispatch({ type: "SELECT_NODE", nodeId: null })} onAddChild={() => dispatch({ type: "ADD_NODE", parentId: selectedNode.id })} onDelete={deleteSelected} onChange={(changes) => dispatch({ type: "UPDATE_NODE", nodeId: selectedNode.id, changes })} />
        ) : null}
      </View>

      {selectedNode && width < 900 ? (
        <NodeInspector node={selectedNode} isRoot={selectedNode.parentId === null} onClose={() => dispatch({ type: "SELECT_NODE", nodeId: null })} onAddChild={() => dispatch({ type: "ADD_NODE", parentId: selectedNode.id })} onDelete={deleteSelected} onChange={(changes) => dispatch({ type: "UPDATE_NODE", nodeId: selectedNode.id, changes })} />
      ) : null}
    </ScreenContainer>
  );
}

function EditorIcon({ icon, label, disabled = false, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; disabled?: boolean; onPress: () => void }) {
  const colors = useColors();
  return <PressableScale accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.editorIcon, { opacity: disabled ? 0.28 : 1 }]}><MaterialIcons name={icon} size={22} color={colors.foreground} /></PressableScale>;
}

const styles = StyleSheet.create({
  header: { minHeight: 64, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: 7, zIndex: 30 },
  headerButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  titleArea: { flex: 1, minWidth: 0, alignItems: "center" },
  titleInput: { width: "100%", maxWidth: 420, paddingVertical: 1, paddingHorizontal: 8, textAlign: "center", fontSize: 16, lineHeight: 21, fontWeight: "800" },
  saveRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  saveDot: { width: 6, height: 6, borderRadius: 3 },
  saveText: { fontSize: 10, lineHeight: 14, fontWeight: "700" },
  editorBody: { flex: 1, flexDirection: "row" },
  canvasArea: { flex: 1, position: "relative" },
  zoomDock: { position: "absolute", left: 14, bottom: 18, height: 48, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 2 },
  actionDock: { position: "absolute", alignSelf: "center", bottom: 18, height: 56, borderRadius: 18, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 5, shadowColor: "#13141B", shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  editorIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  dockDivider: { width: 1, height: 26, marginHorizontal: 3 },
  addTopicButton: { minHeight: 44, borderRadius: 13, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 4 },
  addTopicText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  outline: { position: "absolute", right: 14, top: 14, width: 310, maxHeight: "78%", borderRadius: 18, borderWidth: 1, padding: 12, zIndex: 15, shadowColor: "#101116", shadowOpacity: 0.16, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  outlineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 5, marginBottom: 7 },
  outlineEyebrow: { fontSize: 9, lineHeight: 13, fontWeight: "800", letterSpacing: 0.9 },
  outlineTitle: { fontSize: 19, lineHeight: 24, fontWeight: "800" },
  outlineItem: { minHeight: 58, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: 6 },
  outlineDot: { width: 10, height: 10, borderRadius: 5 },
  outlineText: { flex: 1, marginHorizontal: 10 },
  outlineItemTitle: { fontSize: 14, lineHeight: 19, fontWeight: "700" },
  outlineItemMeta: { fontSize: 11, lineHeight: 15, marginTop: 1 },
  returnButton: { minHeight: 48, borderRadius: 14, justifyContent: "center", paddingHorizontal: 18, marginTop: 18 },
  returnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
