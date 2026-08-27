import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useMindMaps } from "@/context/mind-map-context";
import { useFirebaseSync } from "@/context/firebase-sync-context";
import { useColors } from "@/hooks/use-colors";

export default function SyncScreen() {
  const colors = useColors();
  const { state } = useMindMaps();
  const cloud = useFirebaseSync();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const activeMaps = state.maps.filter((map) => !map.deletedAt);

  const authenticate = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert("Revise os dados", "Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") await cloud.signIn(email, password);
      else await cloud.signUp(email, password);
    } catch {
      // A mensagem amigável já é exibida no cartão.
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>SEUS DADOS, NO SEU CONTROLE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Sincronizar</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>O modo local já está ativo. Conecte o Firebase quando quiser continuar em outros dispositivos.</Text>

        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statusIcon, { backgroundColor: `${colors.success}18` }]}><MaterialIcons name="offline-pin" size={30} color={colors.success} /></View>
          <View style={styles.statusText}><Text style={[styles.statusTitle, { color: colors.foreground }]}>Salvo neste dispositivo</Text><Text style={[styles.statusBody, { color: colors.muted }]}>{activeMaps.length} {activeMaps.length === 1 ? "mapa disponível" : "mapas disponíveis"} offline</Text></View>
          <MaterialIcons name="check-circle" size={24} color={colors.success} />
        </View>

        <View style={[styles.cloudCard, { backgroundColor: colors.foreground }]}>
          <View style={styles.cloudBadge}><MaterialIcons name="cloud-sync" size={27} color={colors.foreground} /></View>
          <Text style={styles.cloudTitle}>{cloud.configured ? cloud.user ? "Conta conectada" : "Conectar ao Firebase" : "Firebase não configurado"}</Text>
          <Text style={styles.cloudBody}>{cloud.configured ? cloud.user ? `Sessão ativa como ${cloud.user.email ?? "usuário autenticado"}. Seus mapas locais só serão enviados quando você tocar em sincronizar.` : "Entre ou crie uma conta para manter uma cópia no Firestore e continuar em outros dispositivos." : "A configuração foi recusada. O aplicativo permanece completo no modo local; você pode adicionar os valores do aplicativo Web do Firebase nas configurações do projeto quando quiser."}</Text>

          {cloud.configured && !cloud.user ? (
            <View style={styles.authArea}>
              <View style={styles.modeRow}>
                <PressableScale onPress={() => setMode("signin")} style={[styles.modeButton, mode === "signin" && styles.modeButtonActive]}><Text style={[styles.modeText, mode === "signin" && styles.modeTextActive]}>Entrar</Text></PressableScale>
                <PressableScale onPress={() => setMode("signup")} style={[styles.modeButton, mode === "signup" && styles.modeButtonActive]}><Text style={[styles.modeText, mode === "signup" && styles.modeTextActive]}>Criar conta</Text></PressableScale>
              </View>
              <TextInput accessibilityLabel="E-mail" autoCapitalize="none" keyboardType="email-address" placeholder="voce@exemplo.com" placeholderTextColor="#92949F" value={email} onChangeText={setEmail} style={styles.authInput} />
              <TextInput accessibilityLabel="Senha" secureTextEntry placeholder="Senha com 6 ou mais caracteres" placeholderTextColor="#92949F" value={password} onChangeText={setPassword} returnKeyType="done" onSubmitEditing={authenticate} style={styles.authInput} />
              {cloud.error ? <Text style={styles.errorText}>{cloud.error}</Text> : null}
              <PressableScale haptic disabled={busy} onPress={authenticate} style={styles.cloudAction}>{busy ? <ActivityIndicator color="#191A23" /> : <Text style={styles.cloudActionText}>{mode === "signin" ? "Entrar" : "Criar conta"}</Text>}</PressableScale>
              {mode === "signin" ? <PressableScale onPress={async () => { if (!email.trim()) { Alert.alert("Informe seu e-mail", "Digite o e-mail da conta antes de redefinir a senha."); return; } try { await cloud.resetPassword(email); Alert.alert("E-mail enviado", "Confira sua caixa de entrada para redefinir a senha."); } catch { /* mensagem no cartão */ } }} style={styles.resetButton}><Text style={styles.resetText}>Esqueci minha senha</Text></PressableScale> : null}
            </View>
          ) : null}

          {cloud.configured && cloud.user ? (
            <View style={styles.authArea}>
              {cloud.error ? <Text style={styles.errorText}>{cloud.error}</Text> : null}
              {cloud.conflicts ? <Text style={styles.warningText}>{cloud.conflicts} conflito(s) preservado(s) como cópia separada.</Text> : null}
              <PressableScale haptic disabled={cloud.status === "syncing"} onPress={cloud.syncNow} style={styles.cloudAction}>{cloud.status === "syncing" ? <ActivityIndicator color="#191A23" /> : <><MaterialIcons name="sync" size={21} color="#191A23" /><Text style={styles.cloudActionText}>Sincronizar agora</Text></>}</PressableScale>
              <PressableScale onPress={cloud.signOut} style={styles.signOutButton}><Text style={styles.signOutText}>Sair da conta</Text></PressableScale>
              {cloud.lastSyncAt ? <Text style={styles.lastSync}>Última sincronização: {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(cloud.lastSyncAt))}</Text> : null}
            </View>
          ) : null}

          {!cloud.configured ? (
            <View style={styles.configHint}><Text style={styles.configTitle}>Valores necessários</Text><Text style={styles.configCode}>API_KEY · AUTH_DOMAIN · PROJECT_ID · STORAGE_BUCKET · SENDER_ID · APP_ID</Text></View>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Como funciona</Text>
        {[
          ["edit-note", "Edite sem interrupções", "Toda mudança é salva primeiro no armazenamento local."],
          ["wifi", "Sincronize quando houver rede", "Uma fila segura enviará apenas alterações pendentes."],
          ["content-copy", "Conflitos preservados", "Versões concorrentes serão duplicadas para evitar perda silenciosa."],
        ].map(([icon, title, body]) => (
          <View key={title} style={styles.step}><View style={[styles.stepIcon, { backgroundColor: `${colors.primary}12` }]}><MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={22} color={colors.primary} /></View><View style={styles.stepText}><Text style={[styles.stepTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.stepBody, { color: colors.muted }]}>{body}</Text></View></View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 700, alignSelf: "center", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120 },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1.2 },
  title: { fontSize: 34, lineHeight: 41, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { marginTop: 7, fontSize: 15, lineHeight: 22 },
  statusCard: { marginTop: 22, borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: "row", alignItems: "center" },
  statusIcon: { width: 54, height: 54, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  statusText: { flex: 1, marginHorizontal: 13 },
  statusTitle: { fontSize: 16, lineHeight: 21, fontWeight: "800" },
  statusBody: { marginTop: 2, fontSize: 13, lineHeight: 18 },
  cloudCard: { marginTop: 14, borderRadius: 20, padding: 22 },
  cloudBadge: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  cloudTitle: { color: "#FFFFFF", marginTop: 18, fontSize: 22, lineHeight: 28, fontWeight: "800" },
  cloudBody: { color: "#C7C8D0", marginTop: 7, fontSize: 14, lineHeight: 21 },
  authArea: { marginTop: 18, gap: 10 },
  modeRow: { flexDirection: "row", backgroundColor: "#30313A", borderRadius: 13, padding: 3 },
  modeButton: { minHeight: 40, flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modeButtonActive: { backgroundColor: "#FFFFFF" },
  modeText: { color: "#C7C8D0", fontSize: 13, fontWeight: "800" },
  modeTextActive: { color: "#191A23" },
  authInput: { minHeight: 48, borderRadius: 13, backgroundColor: "#30313A", color: "#FFFFFF", paddingHorizontal: 13, fontSize: 15 },
  cloudAction: { minHeight: 48, borderRadius: 13, backgroundColor: "#FFFFFF", flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  cloudActionText: { color: "#191A23", fontSize: 14, fontWeight: "800" },
  resetButton: { minHeight: 42, alignItems: "center", justifyContent: "center" },
  resetText: { color: "#D9DAE0", fontSize: 13, fontWeight: "700" },
  signOutButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  signOutText: { color: "#D9DAE0", fontSize: 13, fontWeight: "700" },
  errorText: { color: "#FF9EA6", fontSize: 13, lineHeight: 18, fontWeight: "700" },
  warningText: { color: "#F3C178", fontSize: 13, lineHeight: 18, fontWeight: "700" },
  lastSync: { color: "#BFC0C7", fontSize: 11, textAlign: "center" },
  configHint: { marginTop: 16, borderRadius: 13, backgroundColor: "#30313A", padding: 13 },
  configTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  configCode: { color: "#BFC0C7", fontSize: 10, lineHeight: 16, marginTop: 4 },
  sectionTitle: { marginTop: 28, marginBottom: 8, fontSize: 21, lineHeight: 27, fontWeight: "800" },
  step: { flexDirection: "row", paddingVertical: 10 },
  stepIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepText: { flex: 1, marginLeft: 12 },
  stepTitle: { fontSize: 15, lineHeight: 20, fontWeight: "800" },
  stepBody: { fontSize: 13, lineHeight: 19, marginTop: 2 },
});
