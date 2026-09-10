import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ShareNotificationSheet } from '@/components/ShareNotificationSheet';
import { useDealStasher } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

export default function NotificationDetail() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notifications, toggleFlag } = useDealStasher();
  const [shareOpen, setShareOpen] = useState(false);
  const notification = notifications.find((item) => item.id === id);
  if (!notification) return <Screen><View style={styles.missing}><Text style={[styles.title, { color: colors.foreground }]}>Notification not found</Text></View></Screen>;
  const openLink = async () => {
    if (!notification.actionUrl) return;
    const redirect = `https://www.dealstasher.com/r.php?url=${encodeURIComponent(notification.actionUrl)}`;
    const supported = await Linking.canOpenURL(redirect);
    if (supported) await Linking.openURL(redirect);
    else Alert.alert('Link unavailable', 'This notification link could not be opened right now.');
  };
  return (
    <Screen>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card }]}><Feather name="arrow-left" size={20} color={colors.foreground} /></Pressable><Text style={[styles.headerTitle, { color: colors.foreground }]}>Notification</Text><View style={styles.headerActions}><Pressable accessibilityLabel="Share notification" onPress={() => setShareOpen(true)} style={[styles.iconButton, { backgroundColor: colors.card }]}><Feather name="share-2" size={18} color={colors.foreground} /></Pressable><Pressable accessibilityLabel="Flag notification" onPress={() => toggleFlag(notification.id)} style={[styles.iconButton, { backgroundColor: colors.card }]}><Feather name="star" size={19} color={notification.isFlagged ? colors.accent : colors.mutedForeground} /></Pressable></View></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.appBadge, { backgroundColor: notification.appColor }]}><Text style={styles.appBadgeText}>{notification.appName.slice(0, 1)}</Text></View>
        <Text style={[styles.appName, { color: colors.mutedForeground }]}>{notification.appName} · {new Date(notification.capturedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{notification.title}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{notification.body}</Text>
        <View style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="archive" size={17} color={colors.primary} /><Text style={[styles.savedText, { color: colors.foreground }]}>Saved in your vault</Text><Text style={[styles.savedSubtext, { color: colors.mutedForeground }]}>DealStasher keeps this notification available beyond your phone’s normal history.</Text></View>
        {!!notification.actionUrl && <Pressable onPress={openLink} style={[styles.linkButton, { backgroundColor: colors.primary }]}><Feather name="external-link" size={17} color={colors.primaryForeground} /><Text style={[styles.linkButtonText, { color: colors.primaryForeground }]}>Open offer</Text></Pressable>}
      </ScrollView>
      <ShareNotificationSheet notification={notification} visible={shareOpen} onClose={() => setShareOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, paddingTop: 46 },
  appBadge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  appBadgeText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 24 },
  appName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 18 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, letterSpacing: -0.8, marginTop: 14 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 17, lineHeight: 27, marginTop: 16 },
  savedCard: { borderWidth: 1, borderRadius: 17, padding: 16, marginTop: 36 },
  savedText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 11 },
  savedSubtext: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 5 },
  linkButton: { borderRadius: 16, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 18 },
  linkButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  missing: { padding: 24, justifyContent: 'center', flex: 1 },
});