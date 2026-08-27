import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { MapCard } from "@/components/map-card";
import { ScreenContainer } from "@/components/screen-container";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useMindMaps } from "@/context/mind-map-context";
import { useColors } from "@/hooks/use-colors";
import type { MindMap } from "@/types/mind-map";

export default function LibraryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { state, visibleMaps, dispatch } = useMindMaps();
  const columns = width >= 1050 ? 3 : width >= 680 ? 2 : 1;
  const latestMap = useMemo(() => state.maps.filter((map) => !map.deletedAt).sort((a, b) => Date.parse(b.lastOpenedAt) - Date.parse(a.lastOpenedAt))[0], [state.maps]);

  const openMap = useCallback((map: MindMap) => {
    dispatch({ type: "OPEN_MAP", mapId: map.id });
    router.push({ pathname: "/editor/[id]", params: { id: map.id } });
  }, [dispatch, router]);

  const showMapActions = useCallback((map: MindMap) => {
    const duplicate = () => dispatch({ type: "DUPLICATE_MAP", mapId: map.id });
    const remove = () => dispatch({ type: "MOVE_TO_TRASH", mapId: map.id });
    if (Platform.OS === "web") {
      const choice = globalThis.prompt(`Digite “duplicar” ou “excluir” para ${map.title}`)?.toLocaleLowerCase("pt-BR");
      if (choice === "duplicar") duplicate();
      if (choice === "excluir") remove();
      return;
    }
    Alert.alert(map.title, "Escolha uma ação", [
      { text: "Cancelar", style: "cancel" },
      { text: "Duplicar", onPress: duplicate },
      { text: "Mover para a lixeira", style: "destructive", onPress: remove },
    ]);
  }, [dispatch]);

  if (!state.isHydrated) {
    return <ScreenContainer className="items-center justify-center"><ActivityIndicator color={colors.primary} /><Text className="mt-3 text-muted">Preparando sua biblioteca…</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <FlatList
        key={`maps-${columns}`}
        data={visibleMaps}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={[styles.listContent, { maxWidth: 1180, alignSelf: "center", width: "100%" }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>SEU ESPAÇO DE IDEIAS</Text>
                <Text style={[styles.title, { color: colors.foreground }]}>Biblioteca</Text>
              </View>
              <PressableScale
                haptic
                accessibilityRole="button"
                accessibilityLabel="Criar novo mapa mental"
                onPress={() => router.push("/new-map")}
                style={[styles.newButton, { backgroundColor: colors.primary }]}
              >
                <MaterialIcons name="add" size={23} color="#FFFFFF" />
                <Text style={styles.newButtonText}>Novo mapa</Text>
              </PressableScale>
            </View>

            <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="search" size={22} color={colors.muted} />
              <TextInput
                accessibilityLabel="Buscar mapas"
                value={state.searchQuery}
                onChangeText={(query) => dispatch({ type: "SET_SEARCH", query })}
                placeholder="Buscar por título ou etiqueta"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={[styles.searchInput, { color: colors.foreground }]}
              />
              {state.searchQuery ? (
                <PressableScale accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => dispatch({ type: "SET_SEARCH", query: "" })} style={styles.clearButton}>
                  <MaterialIcons name="cancel" size={20} color={colors.muted} />
                </PressableScale>
              ) : null}
            </View>

            {latestMap && state.filter === "all" && !state.searchQuery ? (
              <PressableScale onPress={() => openMap(latestMap)} style={[styles.continueCard, { backgroundColor: colors.foreground }]}>
                <View style={styles.continueIcon}><MaterialIcons name="arrow-forward" size={22} color={colors.foreground} /></View>
                <View style={styles.continueText}>
                  <Text style={styles.continueLabel}>CONTINUE DE ONDE PAROU</Text>
                  <Text numberOfLines={1} style={styles.continueTitle}>{latestMap.title}</Text>
                  <Text style={styles.continueMeta}>{latestMap.nodes.length} tópicos · salvamento automático</Text>
                </View>
              </PressableScale>
            ) : null}

            <View style={styles.filterRow}>
              {([ ["all", "Todos"], ["recent", "Recentes"], ["favorites", "Favoritos"] ] as const).map(([filter, label]) => {
                const active = state.filter === filter;
                return (
                  <PressableScale
                    key={filter}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => dispatch({ type: "SET_FILTER", filter })}
                    style={[styles.filterButton, { backgroundColor: active ? colors.foreground : colors.surface, borderColor: active ? colors.foreground : colors.border }]}
                  >
                    <Text style={[styles.filterText, { color: active ? colors.background : colors.muted }]}>{label}</Text>
                  </PressableScale>
                );
              })}
            </View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{state.filter === "favorites" ? "Mapas favoritos" : state.searchQuery ? "Resultados" : "Seus mapas"}</Text>
              <Text style={[styles.count, { color: colors.muted }]}>{visibleMaps.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={columns > 1 ? styles.gridItem : styles.listItem}>
            <MapCard
              map={item}
              onOpen={() => openMap(item)}
              onFavorite={() => dispatch({ type: "TOGGLE_FAVORITE", mapId: item.id })}
              onMore={() => showMapActions(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}16` }]}><MaterialIcons name="account-tree" size={34} color={colors.primary} /></View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{state.searchQuery ? "Nenhum mapa encontrado" : state.filter === "favorites" ? "Nenhum favorito ainda" : "Comece pela ideia central"}</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>{state.searchQuery ? "Tente outro termo ou limpe a busca." : "Crie um mapa em branco ou use um modelo didático para estruturar seus pensamentos."}</Text>
            {!state.searchQuery && state.filter !== "favorites" ? (
              <PressableScale haptic onPress={() => router.push("/new-map")} style={[styles.emptyAction, { backgroundColor: colors.primary }]}>
                <Text style={styles.emptyActionText}>Criar primeiro mapa</Text>
              </PressableScale>
            ) : null}
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120 },
  row: { gap: 16 },
  gridItem: { flex: 1, paddingBottom: 16 },
  listItem: { paddingBottom: 14 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1.2 },
  title: { fontSize: 34, lineHeight: 41, fontWeight: "800", letterSpacing: -0.8 },
  newButton: { minHeight: 48, paddingHorizontal: 16, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 7 },
  newButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  search: { minHeight: 52, borderWidth: 1, borderRadius: 15, paddingLeft: 15, paddingRight: 7, flexDirection: "row", alignItems: "center" },
  searchInput: { flex: 1, fontSize: 16, lineHeight: 21, paddingHorizontal: 10, paddingVertical: 12 },
  clearButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  continueCard: { minHeight: 104, borderRadius: 18, marginTop: 16, padding: 16, flexDirection: "row", alignItems: "center" },
  continueIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  continueText: { marginLeft: 14, flex: 1 },
  continueLabel: { color: "#B9BBF8", fontSize: 10, lineHeight: 14, fontWeight: "800", letterSpacing: 1 },
  continueTitle: { color: "#FFFFFF", marginTop: 3, fontSize: 18, lineHeight: 24, fontWeight: "800" },
  continueMeta: { color: "#C7C8D0", marginTop: 2, fontSize: 12, lineHeight: 17 },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 20, marginBottom: 20 },
  filterButton: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 15 },
  filterText: { fontSize: 14, lineHeight: 19, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 21, lineHeight: 27, fontWeight: "800" },
  count: { fontSize: 14, fontWeight: "700" },
  empty: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 36, alignItems: "center" },
  emptyIcon: { width: 66, height: 66, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 20, lineHeight: 26, fontWeight: "800", textAlign: "center" },
  emptyText: { fontSize: 15, lineHeight: 22, textAlign: "center", maxWidth: 440, marginTop: 8 },
  emptyAction: { minHeight: 48, borderRadius: 14, paddingHorizontal: 18, justifyContent: "center", marginTop: 20 },
  emptyActionText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
