import { useSignUp } from '@clerk/expo';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';

export default function SignUp() {
  const colors = useColors();
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const begin = async () => {
    setMessage('');
    const result = await signUp.password({ emailAddress: email.trim(), password });
    if (result.error) {
      setMessage(result.error.message || 'Please check your details and try again.');
      return;
    }
    await signUp.verifications.sendEmailCode();
  };

  const verify = async () => {
    setMessage('');
    const result = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (result.error) {
      setMessage(result.error.message || 'That code was not accepted.');
      return;
    }
    if (signUp.status === 'complete') {
      await signUp.finalize();
      router.replace((typeof redirect === 'string' ? redirect : '/') as Href);
    }
  };

  const isVerification = signUp.status === 'missing_requirements';

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandMark />
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>{isVerification ? 'ONE LAST STEP' : 'START STASHING'}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{isVerification ? 'Check your inbox.' : 'Never lose a good deal again.'}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{isVerification ? `We sent a verification code to ${email}.` : 'Create your free account and keep the offers your phone forgets.'}</Text>
          </View>
          {isVerification ? (
            <>
              <Text style={[styles.label, { color: colors.foreground }]}>Verification code</Text>
              <TextInput style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="6-digit code" placeholderTextColor={colors.mutedForeground} />
              <PrimaryButton label="Verify email" onPress={verify} loading={fetchStatus === 'fetching'} disabled={!code} style={styles.button} />
              <Pressable onPress={() => signUp.verifications.sendEmailCode()} style={styles.resend}><Text style={[styles.link, { color: colors.primary }]}>Send a new code</Text></Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.foreground }]}>Email address</Text>
              <TextInput style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} />
              <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
              <TextInput style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" placeholderTextColor={colors.mutedForeground} />
              {!!errors?.fields?.emailAddress?.message && <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.emailAddress.message}</Text>}
              {!!message && <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>}
              <View nativeID="clerk-captcha" />
              <PrimaryButton label="Create account" onPress={begin} loading={fetchStatus === 'fetching'} disabled={!email || password.length < 8} style={styles.button} />
            </>
          )}
          {!!message && isVerification && <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>Already have an account?</Text>
            <Link href={{ pathname: '/sign-in', params: typeof redirect === 'string' ? { redirect } : undefined }} asChild><Pressable><Text style={[styles.link, { color: colors.primary }]}>Sign in</Text></Pressable></Link>
          </View>
          <Text style={[styles.legal, { color: colors.mutedForeground }]}>Free for 30 days, then $1.99/month or $20/year.</Text>
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
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 40, letterSpacing: -1.1, maxWidth: 330 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 340 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 8, marginTop: 18 },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 54, paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 16 },
  button: { marginTop: 28 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18, marginTop: 10 },
  resend: { alignItems: 'center', marginTop: 18 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 26 },
  switchText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  legal: { textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 40 },
});