import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useMindMaps } from "@/context/mind-map-context";
import { useColors } from "@/hooks/use-colors";
import type { MindMapFilter } from "@/types/mind-map";

const COLLECTIONS: { filter: MindMapFilter; title: string; description: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
  { filter: "recent", title: "Recentes", description: "Mapas abertos por último", icon: "schedule", color: "#3E8ED0" },
  { filter: "favorites", title: "Favoritos", description: "Ideias importantes em destaque", icon: "star", color: "#E9A23B" },
  { filter: "trash", title: "Lixeira", description: "Mapas removidos do seu espaço", icon: "delete-outline", color: "#C94F5A" },
];

export default function OrganizeScreen() {
  const colors = useColors();
  const { state, dispatch } = useMindMaps();

  const countFor = (filter: MindMapFilter) => state.maps.filter((map) => filter === "trash" ? Boolean(map.deletedAt) : !map.deletedAt && (filter !== "favorites" || map.favorite)).length;
  const openCollection = (filter: MindMapFilter) => {
    dispatch({ type: "SET_FILTER", filter });
    router.push("/(tabs)");
  };

  return (
    <ScreenContainer>
      <FlatList
        data={COLLECTIONS}
        keyExtractor={(item) => item.filter}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.heading}><Text style={[styles.eyebrow, { color: colors.primary }]}>ENCONTRE MAIS RÁPIDO</Text><Text style={[styles.title, { color: colors.foreground }]}>Organizar</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Coleções inteligentes mantêm suas ideias acessíveis sem criar pastas desnecessárias.</Text></View>}
        renderItem={({ item }) => (
          <PressableScale onPress={() => openCollection(item.filter)} accessibilityRole="button" accessibilityLabel={`${item.title}, ${countFor(item.filter)} mapas`} style={[styles.collection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.icon, { backgroundColor: `${item.color}18` }]}><MaterialIcons name={item.icon} size={27} color={item.color} /></View>
            <View style={styles.collectionText}><Text style={[styles.collectionTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.collectionDescription, { color: colors.muted }]}>{item.description}</Text></View>
            <View style={styles.trailing}><Text style={[styles.number, { color: colors.foreground }]}>{countFor(item.filter)}</Text><MaterialIcons name="chevron-right" size={24} color={colors.muted} /></View>
          </PressableScale>
        )}
        ListFooterComponent={<View style={[styles.tip, { backgroundColor: `${colors.primary}12` }]}><MaterialIcons name="label-outline" size={23} color={colors.primary} /><View style={styles.tipText}><Text style={[styles.tipTitle, { color: colors.foreground }]}>Etiquetas no editor</Text><Text style={[styles.tipBody, { color: colors.muted }]}>Adicione palavras-chave ao mapa para encontrá-lo pela busca da Biblioteca.</Text></View></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 760, alignSelf: "center", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 110, gap: 12 },
  heading: { marginBottom: 12 },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1.2 },
  title: { fontSize: 34, lineHeight: 41, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { marginTop: 7, maxWidth: 560, fontSize: 15, lineHeight: 22 },
  collection: { minHeight: 86, borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center" },
  icon: { width: 54, height: 54, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  collectionText: { flex: 1, marginHorizontal: 14 },
  collectionTitle: { fontSize: 17, lineHeight: 22, fontWeight: "800" },
  collectionDescription: { marginTop: 2, fontSize: 13, lineHeight: 18 },
  trailing: { flexDirection: "row", alignItems: "center", gap: 4 },
  number: { fontSize: 16, fontWeight: "800" },
  tip: { marginTop: 12, borderRadius: 18, padding: 17, flexDirection: "row" },
  tipText: { flex: 1, marginLeft: 12 },
  tipTitle: { fontSize: 15, lineHeight: 20, fontWeight: "800" },
  tipBody: { fontSize: 13, lineHeight: 19, marginTop: 2 },
});
