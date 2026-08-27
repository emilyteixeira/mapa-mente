import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PressableScale } from "@/components/ui/pressable-scale";
import { NODE_COLORS } from "@/lib/mind-map/domain";
import { useColors } from "@/hooks/use-colors";
import type { MindNode, NodeShape } from "@/types/mind-map";

interface NodeInspectorProps {
  node: MindNode;
  isRoot: boolean;
  onChange: (changes: Partial<Pick<MindNode, "text" | "note" | "color" | "shape">>) => void;
  onAddChild: () => void;
  onDelete: () => void;
  onClose: () => void;
  sidePanel?: boolean;
}

export function NodeInspector({ node, isRoot, onChange, onAddChild, onDelete, onClose, sidePanel = false }: NodeInspectorProps) {
  const colors = useColors();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" && !sidePanel ? "padding" : undefined} style={[styles.container, sidePanel ? styles.sidePanel : styles.bottomPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.handleRow}>
        {!sidePanel ? <View style={[styles.handle, { backgroundColor: colors.border }]} /> : null}
        <PressableScale accessibilityRole="button" accessibilityLabel="Fechar inspetor" onPress={onClose} style={styles.closeButton}><MaterialIcons name="close" size={22} color={colors.muted} /></PressableScale>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{isRoot ? "IDEIA CENTRAL" : "TÓPICO SELECIONADO"}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Editar conteúdo</Text>
        <Text style={[styles.label, { color: colors.muted }]}>Título</Text>
        <TextInput
          accessibilityLabel="Título do tópico"
          value={node.text}
          onChangeText={(text) => onChange({ text })}
          onBlur={() => { if (!node.text.trim()) onChange({ text: "Tópico sem título" }); }}
          returnKeyType="done"
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
        />
        <Text style={[styles.label, { color: colors.muted }]}>Nota opcional</Text>
        <TextInput
          accessibilityLabel="Nota do tópico"
          value={node.note}
          onChangeText={(note) => onChange({ note })}
          placeholder="Acrescente um detalhe ou lembrete"
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={[styles.noteInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
        />

        <Text style={[styles.label, { color: colors.muted }]}>Cor</Text>
        <View style={styles.colorRow}>
          {NODE_COLORS.map((color) => (
            <PressableScale key={color} accessibilityRole="radio" accessibilityLabel={`Usar cor ${color}`} accessibilityState={{ selected: node.color === color }} onPress={() => onChange({ color })} style={[styles.color, { backgroundColor: color, borderColor: node.color === color ? colors.foreground : "transparent" }]}>
              {node.color === color ? <MaterialIcons name="check" size={18} color="#FFFFFF" /> : null}
            </PressableScale>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.muted }]}>Formato</Text>
        <View style={styles.shapeRow}>
          {([ ["rounded", "Arredondado"], ["pill", "Cápsula"], ["rectangle", "Reto"] ] as const).map(([shape, label]) => (
            <PressableScale key={shape} accessibilityRole="radio" accessibilityState={{ selected: node.shape === shape }} onPress={() => onChange({ shape: shape as NodeShape })} style={[styles.shape, { borderColor: node.shape === shape ? colors.primary : colors.border, backgroundColor: node.shape === shape ? `${colors.primary}12` : colors.background }]}>
              <Text style={[styles.shapeText, { color: node.shape === shape ? colors.primary : colors.muted }]}>{label}</Text>
            </PressableScale>
          ))}
        </View>

        <View style={styles.actions}>
          <PressableScale haptic accessibilityRole="button" onPress={onAddChild} style={[styles.addButton, { backgroundColor: colors.primary }]}><MaterialIcons name="add" size={21} color="#FFFFFF" /><Text style={styles.addText}>Adicionar ramificação</Text></PressableScale>
          <PressableScale disabled={isRoot} accessibilityRole="button" accessibilityState={{ disabled: isRoot }} onPress={onDelete} style={[styles.deleteButton, { borderColor: colors.error, opacity: isRoot ? 0.38 : 1 }]}><MaterialIcons name="delete-outline" size={21} color={colors.error} /><Text style={[styles.deleteText, { color: colors.error }]}>{isRoot ? "A ideia central não pode ser excluída" : "Excluir tópico"}</Text></PressableScale>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 20 },
  bottomPanel: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "72%", borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1 },
  sidePanel: { width: 340, height: "100%", borderLeftWidth: 1 },
  handleRow: { minHeight: 40, alignItems: "center", justifyContent: "center" },
  handle: { width: 42, height: 5, borderRadius: 3 },
  closeButton: { position: "absolute", right: 7, top: 2, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
  eyebrow: { fontSize: 10, lineHeight: 15, fontWeight: "800", letterSpacing: 1.1 },
  title: { fontSize: 21, lineHeight: 27, fontWeight: "800", marginBottom: 14 },
  label: { fontSize: 12, lineHeight: 17, fontWeight: "800", marginTop: 12, marginBottom: 6 },
  input: { minHeight: 48, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13, fontSize: 16 },
  noteInput: { minHeight: 76, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, lineHeight: 20 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  color: { width: 44, height: 44, borderRadius: 14, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  shapeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  shape: { minHeight: 42, borderRadius: 12, borderWidth: 1, paddingHorizontal: 11, alignItems: "center", justifyContent: "center" },
  shapeText: { fontSize: 12, fontWeight: "800" },
  actions: { gap: 9, marginTop: 20 },
  addButton: { minHeight: 48, borderRadius: 14, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  addText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  deleteButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 13, fontWeight: "800" },
});
