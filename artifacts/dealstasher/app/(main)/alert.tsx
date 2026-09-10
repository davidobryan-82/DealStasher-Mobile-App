import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { AlertConfig, DateFilter, useDealStasher } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

export default function AlertSetup() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ searchText?: string; appName?: string; flaggedOnly?: string; dateFilter?: DateFilter }>();
  const { lastAlertTargets, saveAlertConfig } = useDealStasher();
  const [email, setEmail] = useState(lastAlertTargets.email);
  const [phone, setPhone] = useState(lastAlertTargets.phone);
  const [message, setMessage] = useState('');
  const save = () => {
    if (!email.trim() && !phone.trim()) { setMessage('Add an email address or phone number so we know where to send matches.'); return; }
    if (email.trim() && !email.includes('@')) { setMessage('That email address looks incomplete.'); return; }
    const config: AlertConfig = { email: email.trim(), phone: phone.trim(), searchText: params.searchText || '', appName: params.appName || 'All apps', flaggedOnly: params.flaggedOnly === 'true', dateFilter: params.dateFilter || 'all', enabled: true };
    saveAlertConfig(config);
    router.back();
  };
  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.eyebrow, { color: colors.primary }]}>SAVED MATCH ALERT</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Catch the next one.</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>We’ll check new notifications against this filter and send a digest starting at 5:00 PM Eastern.</Text>
          <View style={[styles.ruleCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="filter" size={17} color={colors.primary} /><View style={styles.ruleCopy}><Text style={[styles.ruleTitle, { color: colors.foreground }]}>Current filter</Text><Text style={[styles.ruleText, { color: colors.mutedForeground }]}>{params.searchText ? `“${params.searchText}” · ` : 'Any text · '}{params.appName && params.appName !== 'All apps' ? params.appName : 'any app'}{params.flaggedOnly === 'true' ? ' · flagged only' : ''}</Text></View></View>
          <Text style={[styles.label, { color: colors.foreground }]}>Email address</Text>
          <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
          <Text style={[styles.label, { color: colors.foreground }]}>Phone number <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>(optional)</Text></Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(555) 555-5555" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
          {!!message && <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>}
          <View style={styles.delivery}><Feather name="clock" size={16} color={colors.accent} /><Text style={[styles.deliveryText, { color: colors.mutedForeground }]}>New matches are grouped into one daily alert at 5:00 PM ET. You’ll also get a device notification when it goes out.</Text></View>
          <PrimaryButton label="Save match alert" onPress={save} style={styles.button} />
          <PrimaryButton label="Not now" onPress={() => router.back()} secondary style={styles.button} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 38 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, letterSpacing: -1, marginTop: 10 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 13 },
  ruleCard: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 15, marginTop: 26 },
  ruleCopy: { flex: 1 },
  ruleTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  ruleText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 4 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 22, marginBottom: 8 },
  input: { minHeight: 54, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 16 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 13, marginTop: 10 },
  delivery: { flexDirection: 'row', gap: 9, marginTop: 25 },
  deliveryText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  button: { marginTop: 26 },
});