import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useMindMaps } from "@/context/mind-map-context";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const theme = useThemeContext();
  const { state, dispatch } = useMindMaps();
  const update = (changes: Partial<typeof state.preferences>) => dispatch({ type: "SET_PREFERENCES", changes });
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>UMA EXPERIÊNCIA CONFORTÁVEL</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Ajustes</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Personalize o editor sem alterar o conteúdo dos seus mapas.</Text>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>CANVAS</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow icon="grid-on" title="Mostrar grade" description="Exibe uma referência visual discreta" value={state.preferences.showGrid} onChange={(showGrid) => update({ showGrid })} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow icon="gps-fixed" title="Alinhar à grade" description="Organiza o movimento em intervalos" value={state.preferences.snapToGrid} onChange={(snapToGrid) => update({ snapToGrid })} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow icon="animation" title="Reduzir movimento" description="Diminui transições não essenciais" value={state.preferences.reducedMotion} onChange={(reducedMotion) => update({ reducedMotion })} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>APARÊNCIA</Text>
        <View style={[styles.themeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {([ ["light", "Claro", "light-mode"], ["dark", "Escuro", "dark-mode"] ] as const).map(([scheme, label, icon]) => {
            const selected = theme.colorScheme === scheme;
            return <PressableScale key={scheme} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => { theme.setColorScheme(scheme); update({ theme: scheme }); }} style={[styles.themeButton, { backgroundColor: selected ? colors.primary : colors.background, borderColor: selected ? colors.primary : colors.border }]}><MaterialIcons name={icon} size={20} color={selected ? "#FFFFFF" : colors.muted} /><Text style={[styles.themeText, { color: selected ? "#FFFFFF" : colors.foreground }]}>{label}</Text></PressableScale>;
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>ACESSIBILIDADE</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="accessibility-new" size={28} color={colors.primary} />
          <View style={styles.infoText}><Text style={[styles.infoTitle, { color: colors.foreground }]}>Controles além dos gestos</Text><Text style={[styles.infoBody, { color: colors.muted }]}>Adicionar, editar, mover e excluir também estarão disponíveis por botões e menus. O mapa poderá ser percorrido por uma lista semântica.</Text></View>
        </View>
        <PressableScale accessibilityRole="button" onPress={() => router.push("/help" as never)} style={[styles.helpButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.settingIcon, { backgroundColor: `${colors.primary}12` }]}><MaterialIcons name="help-outline" size={22} color={colors.primary} /></View><View style={styles.infoText}><Text style={[styles.infoTitle, { color: colors.foreground }]}>Como usar o editor</Text><Text style={[styles.infoBody, { color: colors.muted }]}>Veja gestos, controles visíveis, modo offline e atalhos na Web.</Text></View><MaterialIcons name="chevron-right" size={23} color={colors.muted} /></PressableScale>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>ARMAZENAMENTO</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="smartphone" size={27} color={colors.success} />
          <View style={styles.infoText}><Text style={[styles.infoTitle, { color: colors.foreground }]}>Modo local ativo</Text><Text style={[styles.infoBody, { color: colors.muted }]}>Seus mapas são salvos automaticamente neste dispositivo. A nuvem será opcional.</Text>{state.lastSavedAt ? <Text style={[styles.savedAt, { color: colors.success }]}>Último salvamento: {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(state.lastSavedAt))}</Text> : null}</View>
        </View>

        <Text style={[styles.version, { color: colors.muted }]}>MapaMente · versão 1.0.0</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({ icon, title, description, value, onChange }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  const colors = useColors();
  return <View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: `${colors.primary}12` }]}><MaterialIcons name={icon} size={21} color={colors.primary} /></View><View style={styles.settingText}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingDescription, { color: colors.muted }]}>{description}</Text></View><Switch accessibilityLabel={title} value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: `${colors.primary}80` }} thumbColor={value ? colors.primary : colors.muted} /></View>;
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 700, alignSelf: "center", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120 },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1.2 },
  title: { fontSize: 34, lineHeight: 41, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { marginTop: 7, fontSize: 15, lineHeight: 22 },
  sectionLabel: { marginTop: 26, marginBottom: 8, fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1.1 },
  group: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  settingRow: { minHeight: 78, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  settingIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  settingText: { flex: 1, marginHorizontal: 12 },
  settingTitle: { fontSize: 15, lineHeight: 20, fontWeight: "800" },
  settingDescription: { marginTop: 2, fontSize: 12, lineHeight: 17 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 68 },
  infoCard: { borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: "row" },
  helpButton: { minHeight: 76, marginTop: 10, borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center" },
  infoText: { flex: 1, marginLeft: 13 },
  infoTitle: { fontSize: 15, lineHeight: 20, fontWeight: "800" },
  infoBody: { fontSize: 13, lineHeight: 19, marginTop: 3 },
  savedAt: { fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 7 },
  version: { textAlign: "center", fontSize: 12, lineHeight: 18, marginTop: 30 },
  themeRow: { borderRadius: 18, borderWidth: 1, padding: 8, flexDirection: "row", gap: 8 },
  themeButton: { flex: 1, minHeight: 48, borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  themeText: { fontSize: 13, fontWeight: "800" },
});
