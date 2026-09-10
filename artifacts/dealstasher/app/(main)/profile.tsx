import { Feather } from '@expo/vector-icons';
import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Screen } from '@/components/Screen';
import { useDealStasher } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

function ProfileRow({ icon, label, detail, onPress, destructive = false }: { icon: keyof typeof Feather.glyphMap; label: string; detail?: string; onPress: () => void; destructive?: boolean }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.profileRow, { borderColor: colors.border, opacity: pressed ? 0.78 : 1 }]}><View style={[styles.rowIcon, { backgroundColor: destructive ? colors.destructive : colors.secondary }]}><Feather name={icon} size={17} color={destructive ? colors.destructiveForeground : colors.foreground} /></View><View style={styles.rowCopy}><Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>{label}</Text>{!!detail && <Text style={[styles.rowDetail, { color: colors.mutedForeground }]}>{detail}</Text>}</View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

export default function Profile() {
  const colors = useColors();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { membership, updateMembership, alertConfigs, captureStatus, openCaptureSettings, refreshCapturedNotifications } = useDealStasher();
  const name = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Deal hunter';
  const initials = name.slice(0, 1).toUpperCase();
  const membershipLabel = membership === 'trial' ? 'Free trial · 30 days' : membership === 'active' ? 'DealStasher Plus' : membership === 'paused' ? 'Membership paused' : 'Membership cancelled';
  const logout = () => Alert.alert('Log out?', 'You can sign back in anytime.', [{ text: 'Stay signed in', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: () => signOut() }]);
  const cancel = () => Alert.alert('Cancel membership?', 'Your notification stash stays on this device, but future alerts and captures will stop after the current period.', [{ text: 'Keep it', style: 'cancel' }, { text: 'Cancel membership', style: 'destructive', onPress: () => updateMembership('cancelled') }]);
  const connectNotifications = async () => {
    if (Platform.OS === 'android') {
      await openCaptureSettings();
      return;
    }
    if (Platform.OS === 'ios') {
      Alert.alert('Import from iPhone', 'iOS does not allow apps to read every notification automatically. Share a notification’s text or link from another app and choose DealStasher to add it to your stash. DealStasher only stores content you explicitly share.', [{ text: 'Got it' }]);
      return;
    }
    Alert.alert('Use a store build', 'Real notification capture is available in the Android store build. iPhone notifications can be imported through the iOS share extension.');
  };
  const captureDetail = Platform.OS === 'android'
    ? captureStatus === 'enabled' ? 'Connected · capturing new notifications' : 'Tap to enable Android Notification Access'
    : Platform.OS === 'ios' ? 'Use Share to import notification text or links' : 'Available in the iOS and Android store builds';
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><BrandMark compact /><Pressable onPress={() => router.back()} style={[styles.close, { backgroundColor: colors.card }]}><Feather name="x" size={20} color={colors.foreground} /></Pressable></View>
        <View style={styles.identity}><View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{initials}</Text></View><Text style={[styles.name, { color: colors.foreground }]}>{name}</Text><Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.emailAddresses?.[0]?.emailAddress || 'Your DealStasher account'}</Text></View>
        <View style={[styles.membership, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.membershipTop}><View><Text style={[styles.membershipLabel, { color: colors.mutedForeground }]}>MEMBERSHIP</Text><Text style={[styles.membershipTitle, { color: colors.foreground }]}>{membershipLabel}</Text></View><Feather name="shield" size={22} color={colors.accent} /></View><Text style={[styles.membershipBody, { color: colors.mutedForeground }]}>{membership === 'trial' ? 'Your full vault is unlocked. Choose a plan before your trial ends.' : 'Your notification history and saved matches are protected.'}</Text><Pressable onPress={() => router.push('/subscription')}><Text style={[styles.manage, { color: colors.primary }]}>{membership === 'active' ? 'Manage plan' : 'See plans'}</Text></Pressable></View>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR ACCOUNT</Text>
         <ProfileRow icon="inbox" label="Friend inbox" detail="See notifications shared with you" onPress={() => router.push('/inbox')} />
        <ProfileRow icon="bell" label="Saved match alerts" detail={alertConfigs.length ? `${alertConfigs.length} alert${alertConfigs.length === 1 ? '' : 's'} active` : 'Set up your first alert'} onPress={() => router.push('/alert')} />
         <ProfileRow icon="smartphone" label="Notification access" detail={captureDetail} onPress={connectNotifications} />
         {Platform.OS === 'android' && captureStatus === 'enabled' && <ProfileRow icon="refresh-cw" label="Refresh captures" detail="Check for notifications received while the app was closed" onPress={refreshCapturedNotifications} />}
        <ProfileRow icon="pause-circle" label="Pause membership" detail="Temporarily stop billing and alerts" onPress={() => updateMembership(membership === 'paused' ? 'active' : 'paused')} />
        <ProfileRow icon="credit-card" label="Membership & billing" detail="$1.99/month or $20/year" onPress={() => router.push('/subscription')} />
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 26 }]}>SESSION</Text>
        <ProfileRow icon="log-out" label="Log out" onPress={logout} destructive />
        {membership !== 'cancelled' && <Pressable onPress={cancel} style={styles.cancel}><Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel membership</Text></Pressable>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  identity: { alignItems: 'center', marginTop: 28 },
  avatar: { width: 70, height: 70, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 21, marginTop: 12 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4 },
  membership: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 28 },
  membershipTop: { flexDirection: 'row', justifyContent: 'space-between' },
  membershipLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  membershipTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 7 },
  membershipBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 14 },
  manage: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 14 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3, marginTop: 30, marginBottom: 7 },
  profileRow: { minHeight: 67, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  rowDetail: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  cancel: { alignItems: 'center', paddingTop: 24 },
  cancelText: { fontFamily: 'Inter_500Medium', fontSize: 13, textDecorationLine: 'underline' },
});