import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useDealStasher } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

export default function Subscription() {
  const colors = useColors();
  const router = useRouter();
  const { membership, updateMembership } = useDealStasher();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const choose = () => { updateMembership('active'); router.back(); };
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.card }]}><Feather name="arrow-left" size={19} color={colors.foreground} /></Pressable>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>KEEP YOUR STASH</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Your deals deserve more than 24 hours.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Try every feature free for 30 days. Keep it going for less than one impulse buy.</Text>
        <View style={[styles.trialCard, { backgroundColor: colors.primary }]}><Feather name="gift" size={21} color={colors.primaryForeground} /><Text style={[styles.trialTitle, { color: colors.primaryForeground }]}>30 days on us</Text><Text style={[styles.trialBody, { color: colors.primaryForeground }]}>Your trial includes the full vault, saved alerts, and unlimited flags.</Text></View>
        <Pressable onPress={() => setPlan('monthly')} style={[styles.plan, { backgroundColor: colors.card, borderColor: plan === 'monthly' ? colors.primary : colors.border }]}><View style={[styles.radio, { borderColor: plan === 'monthly' ? colors.primary : colors.mutedForeground }]}>{plan === 'monthly' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}</View><View style={styles.planCopy}><Text style={[styles.planTitle, { color: colors.foreground }]}>Monthly</Text><Text style={[styles.planSub, { color: colors.mutedForeground }]}>Flexible, cancel anytime</Text></View><Text style={[styles.price, { color: colors.foreground }]}>$1.99<Text style={[styles.priceUnit, { color: colors.mutedForeground }]}> / mo</Text></Text></Pressable>
        <Pressable onPress={() => setPlan('yearly')} style={[styles.plan, { backgroundColor: colors.card, borderColor: plan === 'yearly' ? colors.primary : colors.border }]}><View style={[styles.radio, { borderColor: plan === 'yearly' ? colors.primary : colors.mutedForeground }]}>{plan === 'yearly' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}</View><View style={styles.planCopy}><View style={styles.planTitleRow}><Text style={[styles.planTitle, { color: colors.foreground }]}>Yearly</Text><Text style={[styles.best, { color: colors.accentForeground, backgroundColor: colors.accent }]}>BEST VALUE</Text></View><Text style={[styles.planSub, { color: colors.mutedForeground }]}>Save nearly 20%</Text></View><Text style={[styles.price, { color: colors.foreground }]}>$20<Text style={[styles.priceUnit, { color: colors.mutedForeground }]}> / yr</Text></Text></Pressable>
        <PrimaryButton label={membership === 'trial' ? 'Start free trial' : 'Switch plan'} onPress={choose} style={styles.button} />
        <Text style={[styles.note, { color: colors.mutedForeground }]}>Subscriptions are billed through Apple App Store or Google Play on mobile. Credit card and PayPal billing can be enabled for web checkout.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 18, paddingBottom: 40 },
  back: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 35 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, letterSpacing: -1, marginTop: 10 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 13 },
  trialCard: { borderRadius: 19, padding: 18, marginTop: 28 },
  trialTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 14 },
  trialBody: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19, marginTop: 5, maxWidth: 280 },
  plan: { borderWidth: 1, borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  planCopy: { flex: 1, marginLeft: 12 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  planTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  planSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  best: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.6, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  price: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  priceUnit: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  button: { marginTop: 26 },
  note: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 17 },
});