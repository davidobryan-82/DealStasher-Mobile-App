import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { getAuthRedirect } from '@/lib/authRedirect';
import { attemptGoogleAuth } from '@/lib/googleAuth';

WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

type GoogleAuthButtonProps = {
  redirect?: string;
};

export function GoogleAuthButton({ redirect }: GoogleAuthButtonProps) {
  useWarmUpBrowser();
  const colors = useColors();
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const continueWithGoogle = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await attemptGoogleAuth(
      startSSOFlow,
      AuthSession.makeRedirectUri({
        scheme: 'dealstasher',
        path: 'oauth-native',
      }),
    );

    if (result.kind === 'active') {
      router.replace(getAuthRedirect(redirect) as Href);
    } else {
      setError(result.message);
    }

    setLoading(false);
  }, [redirect, router, startSSOFlow]);

  return (
    <View>
      <Pressable
        testID="google-auth-button"
        onPress={continueWithGoogle}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ busy: loading }}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed || loading ? 0.7 : 1 },
        ]}
      >
        <View style={[styles.googleMark, { borderColor: colors.border }]}>
          <Text style={[styles.googleLetter, { color: colors.primary }]}>G</Text>
        </View>
        <Text style={[styles.buttonText, { color: colors.foreground }]}>
          {loading ? 'Connecting to Google…' : 'Continue with Google'}
        </Text>
        {!loading && <Feather name="arrow-right" size={17} color={colors.mutedForeground} />}
      </Pressable>
      {!!error && (
        <View style={styles.errorRow}>
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          <Pressable
            testID="google-auth-retry"
            onPress={continueWithGoogle}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Try Google sign-in again"
            hitSlop={8}
          >
            <Text style={[styles.retry, { color: colors.primary }]}>Try again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 54, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  googleMark: { width: 25, height: 25, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  googleLetter: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  buttonText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, flex: 1 },
  errorRow: { marginTop: 10, gap: 4 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18 },
  retry: { fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 18 },
});