import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useMindMaps } from "@/context/mind-map-context";
import { useColors } from "@/hooks/use-colors";
import type { MapTemplateId } from "@/types/mind-map";

const TEMPLATES: { id: MapTemplateId; title: string; description: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
  { id: "blank", title: "Em branco", description: "Comece apenas com a ideia central", icon: "radio-button-unchecked", color: "#5B5CE2" },
  { id: "study", title: "Estudo", description: "Conceitos, exemplos, revisão e dúvidas", icon: "school", color: "#3E8ED0" },
  { id: "project", title: "Projeto", description: "Objetivos, entregas, riscos e pessoas", icon: "task-alt", color: "#2E9B73" },
  { id: "brainstorm", title: "Brainstorm", description: "Ideias livres, perguntas e conexões", icon: "lightbulb", color: "#E9A23B" },
];

export default function NewMapScreen() {
  const router = useRouter();
  const colors = useColors();
  const { dispatch } = useMindMaps();
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<MapTemplateId>("blank");

  const create = () => {
    dispatch({ type: "CREATE_MAP", title, template });
    router.replace({ pathname: "/editor/[id]", params: { id: "new" } });
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <PressableScale accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => router.back()} style={styles.headerButton}>
              <MaterialIcons name="close" size={25} color={colors.foreground} />
            </PressableScale>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Novo mapa</Text>
            <View style={styles.headerButton} />
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Qual é a ideia central?</Text>
          <TextInput
            autoFocus
            accessibilityLabel="Título do novo mapa"
            placeholder="Ex.: Visão Computacional"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
            onSubmitEditing={create}
            style={[styles.titleInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
          />

          <Text style={[styles.label, styles.templateLabel, { color: colors.foreground }]}>Escolha um ponto de partida</Text>
          <Text style={[styles.helper, { color: colors.muted }]}>Você poderá editar todos os tópicos depois.</Text>
          <View style={styles.templates}>
            {TEMPLATES.map((item) => {
              const selected = template === item.id;
              return (
                <PressableScale
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${item.title}. ${item.description}`}
                  onPress={() => setTemplate(item.id)}
                  style={[styles.template, { backgroundColor: colors.surface, borderColor: selected ? colors.primary : colors.border, borderWidth: selected ? 2 : 1 }]}
                >
                  <View style={[styles.templateIcon, { backgroundColor: `${item.color}18` }]}><MaterialIcons name={item.icon} size={25} color={item.color} /></View>
                  <View style={styles.templateText}>
                    <Text style={[styles.templateTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.templateDescription, { color: colors.muted }]}>{item.description}</Text>
                  </View>
                  <MaterialIcons name={selected ? "radio-button-checked" : "radio-button-unchecked"} size={22} color={selected ? colors.primary : colors.muted} />
                </PressableScale>
              );
            })}
          </View>

          <PressableScale haptic accessibilityRole="button" accessibilityLabel="Criar mapa e abrir editor" onPress={create} style={[styles.createButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.createText}>Criar e começar</Text>
            <MaterialIcons name="arrow-forward" size={21} color="#FFFFFF" />
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 20, paddingBottom: 36 },
  header: { minHeight: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  headerButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  label: { fontSize: 22, lineHeight: 28, fontWeight: "800", letterSpacing: -0.3 },
  titleInput: { minHeight: 58, borderWidth: 1, borderRadius: 16, fontSize: 18, paddingHorizontal: 16, marginTop: 12 },
  templateLabel: { marginTop: 30 },
  helper: { fontSize: 14, lineHeight: 20, marginTop: 3 },
  templates: { gap: 10, marginTop: 14 },
  template: { minHeight: 78, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  templateIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  templateText: { flex: 1, marginHorizontal: 12 },
  templateTitle: { fontSize: 16, lineHeight: 21, fontWeight: "800" },
  templateDescription: { marginTop: 2, fontSize: 13, lineHeight: 18 },
  createButton: { minHeight: 54, borderRadius: 16, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 26 },
  createText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
