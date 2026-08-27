import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useColors } from "@/hooks/use-colors";

const GUIDES = [
  { icon: "touch-app" as const, title: "Selecionar e mover", body: "Toque em um tópico para selecioná-lo. Arraste o cartão para reorganizar o mapa." },
  { icon: "add-circle-outline" as const, title: "Criar ramificações", body: "Selecione um tópico e toque em Tópico. O novo cartão já nasce conectado ao anterior." },
  { icon: "zoom-in" as const, title: "Navegar no canvas", body: "Use pinça para zoom e arraste o fundo para mover. Os três botões no canto também oferecem zoom e enquadramento." },
  { icon: "edit-note" as const, title: "Editar conteúdo", body: "Após selecionar um tópico, use o inspetor para alterar título, nota, cor e formato." },
  { icon: "format-list-bulleted" as const, title: "Percorrer por lista", body: "Abra Estrutura na barra superior do editor para navegar pelos tópicos sem depender do conteúdo espacial." },
  { icon: "offline-bolt" as const, title: "Trabalhar offline", body: "As alterações são salvas primeiro no dispositivo. A conta Firebase é opcional e apenas adiciona sincronização." },
];

export default function HelpScreen() {
  const router = useRouter();
  const colors = useColors();
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><PressableScale accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.headerButton}><MaterialIcons name="arrow-back" size={24} color={colors.foreground} /></PressableScale><Text style={[styles.headerTitle, { color: colors.foreground }]}>Ajuda</Text><View style={styles.headerButton} /></View>
        <View style={[styles.heroIcon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name="tips-and-updates" size={36} color={colors.primary} /></View>
        <Text style={[styles.title, { color: colors.foreground }]}>Seu mapa, do seu jeito</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Todos os gestos essenciais possuem uma alternativa visível. Use estas dicas para começar.</Text>
        <View style={styles.guides}>
          {GUIDES.map((guide, index) => <View key={guide.title} style={[styles.guide, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.number, { backgroundColor: `${colors.primary}14` }]}><Text style={[styles.numberText, { color: colors.primary }]}>{index + 1}</Text></View><View style={styles.guideText}><View style={styles.guideTitleRow}><MaterialIcons name={guide.icon} size={20} color={colors.primary} /><Text style={[styles.guideTitle, { color: colors.foreground }]}>{guide.title}</Text></View><Text style={[styles.guideBody, { color: colors.muted }]}>{guide.body}</Text></View></View>)}
        </View>
        <View style={[styles.shortcutCard, { backgroundColor: colors.foreground }]}><Text style={styles.shortcutTitle}>Atalhos na Web</Text><Text style={styles.shortcutBody}>Ctrl/⌘ + Z desfaz · Ctrl/⌘ + Shift + Z refaz · + e − controlam o zoom · 0 enquadra o mapa.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: 18, paddingBottom: 40 },
  header: { minHeight: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  heroIcon: { width: 70, height: 70, borderRadius: 22, alignItems: "center", justifyContent: "center", marginTop: 12 },
  title: { marginTop: 16, fontSize: 30, lineHeight: 37, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { marginTop: 7, fontSize: 15, lineHeight: 22, maxWidth: 560 },
  guides: { gap: 10, marginTop: 24 },
  guide: { borderWidth: 1, borderRadius: 17, padding: 15, flexDirection: "row" },
  number: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  numberText: { fontSize: 14, fontWeight: "900" },
  guideText: { flex: 1, marginLeft: 12 },
  guideTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  guideTitle: { fontSize: 15, lineHeight: 20, fontWeight: "800" },
  guideBody: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  shortcutCard: { marginTop: 14, borderRadius: 18, padding: 18 },
  shortcutTitle: { color: "#FFFFFF", fontSize: 16, lineHeight: 21, fontWeight: "800" },
  shortcutBody: { color: "#C7C8D0", fontSize: 13, lineHeight: 19, marginTop: 5 },
});
