import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useDealStasher } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

const slides = [
  { icon: 'archive', eyebrow: 'YOUR PERSONAL DEAL VAULT', title: 'Keep the good stuff.', body: 'DealStasher remembers every notification so you can revisit offers when you actually have time to use them.' },
  { icon: 'search', eyebrow: 'FIND IT IN SECONDS', title: 'Search by what matters.', body: 'Filter your stash by date, app, words in the notification, or only the deals you flagged as important.' },
  { icon: 'bell', eyebrow: 'STAY AHEAD OF EXPIRY', title: 'Get the next match.', body: 'Save a filter and DealStasher can alert you when a new notification matches, starting with the 5pm ET digest.' },
];

export default function Tour() {
  const colors = useColors();
  const router = useRouter();
  const { completeTour } = useDealStasher();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const finish = () => { completeTour(); router.replace('/home'); };
  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <View style={styles.container}>
        <View style={styles.top}><BrandMark compact /><Pressable onPress={finish}><Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip</Text></Pressable></View>
        <View style={[styles.illustration, { backgroundColor: colors.card }]}>
          <View style={[styles.glow, { backgroundColor: colors.primary }]} />
          <Feather name={slide.icon as 'archive'} size={68} color={colors.primary} />
          <View style={[styles.spark, { backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{slide.eyebrow}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{slide.title}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{slide.body}</Text>
        <View style={styles.dots}>{slides.map((item, dotIndex) => <View key={item.eyebrow} style={[styles.dot, { backgroundColor: dotIndex === index ? colors.primary : colors.border, width: dotIndex === index ? 26 : 7 }]} />)}</View>
        <PrimaryButton label={index === slides.length - 1 ? 'Open my stash' : 'Next'} onPress={() => index === slides.length - 1 ? finish() : setIndex(index + 1)} style={styles.button} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 },
  skip: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  illustration: { height: 280, borderRadius: 30, marginTop: 56, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', width: 170, height: 170, borderRadius: 90, opacity: 0.11 },
  spark: { position: 'absolute', width: 12, height: 12, borderRadius: 6, top: 60, right: 54 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.5, marginTop: 42 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, letterSpacing: -1, marginTop: 12 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 330 },
  dots: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 30 },
  dot: { height: 7, borderRadius: 4 },
  button: { marginTop: 'auto' },
});