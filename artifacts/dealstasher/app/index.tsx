import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@clerk/expo';
import { BrandMark } from '@/components/BrandMark';
import { useDealStasher } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

export default function Index() {
  const colors = useColors();
  const { isLoaded, isSignedIn } = useAuth();
  const { ready, hasSeenTour } = useDealStasher();
  if (!isLoaded || !ready) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <BrandMark />
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>Opening your stash…</Text>
      </View>
    );
  }
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (!hasSeenTour) return <Redirect href="/tour" />;
  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  spinner: { marginTop: 28 },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 14, marginTop: 12 },
});