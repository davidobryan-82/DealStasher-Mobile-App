import { useSignIn } from '@clerk/expo';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';

export default function SignIn() {
  const colors = useColors();
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('');
    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (result.error) {
      setMessage(result.error.message || 'That sign-in did not work. Check your details and try again.');
      return;
    }
    if (signIn.status === 'complete') {
      await signIn.finalize();
      router.replace((typeof redirect === 'string' ? redirect : '/') as Href);
    } else {
      setMessage('This account needs another verification step before it can sign in.');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandMark />
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>WELCOME BACK</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Your deals are still here.</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Keep every offer searchable long after your phone clears it.</Text>
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>Email address</Text>
          <TextInput style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} />
          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <TextInput style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" placeholderTextColor={colors.mutedForeground} />
          {!!errors?.fields?.identifier?.message && <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.identifier.message}</Text>}
          {!!message && <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>}
          <PrimaryButton label="Sign in" onPress={submit} loading={fetchStatus === 'fetching'} disabled={!email || !password} style={styles.button} />
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>New to DealStasher?</Text>
            <Link href={{ pathname: '/sign-up', params: typeof redirect === 'string' ? { redirect } : undefined }} asChild>
              <Pressable><Text style={[styles.link, { color: colors.primary }]}>Create an account</Text></Pressable>
            </Link>
          </View>
          <Text style={[styles.legal, { color: colors.mutedForeground }]}>Start with a 30-day free trial. Cancel anytime.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 34, flexGrow: 1 },
  heading: { marginTop: 70, marginBottom: 34 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.5, marginBottom: 12 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 40, letterSpacing: -1.1, maxWidth: 320 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 330 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 8, marginTop: 18 },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 54, paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 16 },
  button: { marginTop: 28 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18, marginTop: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 26 },
  switchText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  legal: { textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 40 },
});