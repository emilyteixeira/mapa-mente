import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PressableScale } from "@/components/ui/pressable-scale";
import { useColors } from "@/hooks/use-colors";
import type { MindMap } from "@/types/mind-map";

interface MapCardProps {
  map: MindMap;
  onOpen: () => void;
  onFavorite: () => void;
  onMore: () => void;
  compact?: boolean;
}

function relativeDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Editado hoje";
  if (diffDays === 1) return "Editado ontem";
  if (diffDays < 7) return `Editado há ${diffDays} dias`;
  return `Editado em ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date)}`;
}

export const MapCard = memo(function MapCard({ map, onOpen, onFavorite, onMore, compact = false }: MapCardProps) {
  const colors = useColors();
  const visibleNodes = map.nodes.slice(0, 5);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Abrir mapa ${map.title}, ${map.nodes.length} tópicos`}
      onPress={onOpen}
      style={[styles.card, compact && styles.cardCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.preview, { backgroundColor: `${map.nodes[0]?.color ?? colors.primary}12` }]}>
        <View style={[styles.previewLine, { backgroundColor: `${map.nodes[0]?.color ?? colors.primary}55` }]} />
        {visibleNodes.map((node, index) => (
          <View
            key={node.id}
            style={[
              styles.previewNode,
              {
                backgroundColor: node.color,
                left: index === 0 ? "35%" : index % 2 === 0 ? "66%" : "8%",
                top: index === 0 ? "42%" : `${12 + index * 16}%`,
                width: index === 0 ? 74 : 48,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleArea}>
            <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.foreground }]}>{map.title}</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{relativeDate(map.updatedAt)} · {map.nodes.length} tópicos</Text>
          </View>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={map.favorite ? `Remover ${map.title} dos favoritos` : `Adicionar ${map.title} aos favoritos`}
            hitSlop={8}
            onPress={(event) => { event.stopPropagation(); onFavorite(); }}
            style={styles.iconButton}
          >
            <MaterialIcons name={map.favorite ? "star" : "star-border"} size={22} color={map.favorite ? "#E9A23B" : colors.muted} />
          </PressableScale>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Mais ações para ${map.title}`}
            hitSlop={8}
            onPress={(event) => { event.stopPropagation(); onMore(); }}
            style={styles.iconButton}
          >
            <MaterialIcons name="more-horiz" size={23} color={colors.muted} />
          </PressableScale>
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 18, overflow: "hidden" },
  cardCompact: { maxWidth: 520 },
  preview: { height: 118, position: "relative", overflow: "hidden" },
  previewLine: { position: "absolute", width: "58%", height: 2, left: "20%", top: "50%", transform: [{ rotate: "-7deg" }] },
  previewNode: { position: "absolute", height: 16, borderRadius: 8 },
  cardBody: { paddingHorizontal: 14, paddingVertical: 13 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardTitleArea: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: "700" },
  meta: { marginTop: 3, fontSize: 12, lineHeight: 17 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
