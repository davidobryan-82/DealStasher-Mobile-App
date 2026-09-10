import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { backgroundColor: colors.primary }]}>
        <Feather name="bookmark" size={compact ? 16 : 18} color={colors.primaryForeground} />
      </View>
      {!compact && (
        <Text style={[styles.wordmark, { color: colors.foreground }]}>
          Deal<Text style={{ color: colors.primary }}>Stasher</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 21, letterSpacing: -0.6 },
});