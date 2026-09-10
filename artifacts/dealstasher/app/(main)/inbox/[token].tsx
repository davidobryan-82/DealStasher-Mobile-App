import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useClaimSharedNotification, useGetSharedNotification } from '@workspace/api-client-react';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';
import { buildAuthRoute, getSharedInboxRedirect } from '@/lib/authRedirect';
import { claimSharedInboxOnce, getCompletedSharedInboxClaim } from '@/lib/sharedInboxClaim';

export default function SharedNotification() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const { token } = useLocalSearchParams<{ token: string }>();
  const shareToken = Array.isArray(token) ? token[0] : token;
  const shared = useGetSharedNotification(shareToken ?? '');
  const claim = useClaimSharedNotification();
  const claimKey = userId && shareToken ? `${userId}:${shareToken}` : null;
  const [savedClaim, setSavedClaim] = useState<unknown>(() =>
    claimKey ? getCompletedSharedInboxClaim(claimKey) : undefined,
  );
  const [claimPending, setClaimPending] = useState(false);
  const [claimError, setClaimError] = useState(false);

  useEffect(() => {
    setSavedClaim(claimKey ? getCompletedSharedInboxClaim(claimKey) : undefined);
    setClaimPending(false);
    setClaimError(false);
  }, [claimKey]);

  const attemptClaim = useCallback(() => {
    if (!claimKey || !shareToken || !isSignedIn || claimPending || savedClaim) return;

    setClaimError(false);
    setClaimPending(true);
    void claimSharedInboxOnce(claimKey, () => claim.mutateAsync({ token: shareToken }))
      .then((result) => {
        setSavedClaim(result);
      })
      .catch((error) => {
        setClaimError(true);
      })
      .finally(() => {
        setClaimPending(false);
      });
  }, [claim.mutateAsync, claimKey, claimPending, isSignedIn, savedClaim, shareToken]);

  useEffect(() => {
    if (isSignedIn && shared.data && !savedClaim && !claimPending) {
      attemptClaim();
    }
  }, [attemptClaim, claimPending, isSignedIn, savedClaim, shared.data]);

  if (shared.isLoading) {
    return <Screen><View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={[styles.status, { color: colors.mutedForeground }]}>Opening shared notification…</Text></View></Screen>;
  }

  if (shared.isError || !shared.data) {
    return <Screen><View style={styles.center}><Feather name="alert-circle" size={30} color={colors.destructive} /><Text style={[styles.title, { color: colors.foreground }]}>This link is unavailable</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>The shared notification may have expired or already been removed.</Text><PrimaryButton label="Back to DealStasher" onPress={() => router.replace('/')} style={styles.button} /></View></Screen>;
  }

  const notification = shared.data;
  const openOffer = () => {
    if (notification.actionUrl) Linking.openURL(notification.actionUrl);
  };

  return (
    <Screen>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card }]}><Feather name="arrow-left" size={20} color={colors.foreground} /></Pressable><Text style={[styles.headerTitle, { color: colors.foreground }]}>Shared with you</Text><Feather name="inbox" size={19} color={colors.primary} /></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.senderCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{notification.senderName.slice(0, 1).toUpperCase()}</Text></View><View style={styles.senderCopy}><Text style={[styles.sender, { color: colors.foreground }]}>{notification.senderName} says:</Text><Text style={[styles.message, { color: colors.primary }]}>{notification.message || 'This made me think of you.'}</Text></View></View>
        <Text style={[styles.title, { color: colors.foreground }]}>{notification.notificationTitle}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{notification.notificationBody}</Text>
        <View style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name={savedClaim ? 'check-circle' : claimError ? 'alert-circle' : 'inbox'} size={17} color={claimError ? colors.destructive : colors.primary} />
          <Text style={[styles.savedTitle, { color: colors.foreground }]}>
            {savedClaim ? 'Saved to your inbox' : claimError ? 'Could not save to your inbox' : isSignedIn ? 'Saving to your inbox…' : 'Sign in to save this'}
          </Text>
          <Text style={[styles.savedBody, { color: colors.mutedForeground }]}>
            {claimError
              ? 'You can still read this shared notification. Try again to save it to your inbox.'
              : isSignedIn
                ? 'You can find this message anytime from the profile menu.'
                : 'Create or sign in to a DealStasher account so this shared notification stays with you.'}
          </Text>
          {isSignedIn && claimError && !savedClaim && (
            <PrimaryButton label="Try again" onPress={attemptClaim} loading={claimPending} style={styles.button} />
          )}
        </View>
        {!isSignedIn && <PrimaryButton label="Sign in to save it" onPress={() => router.push(buildAuthRoute('/sign-in', getSharedInboxRedirect(shareToken ?? '')))} style={styles.button} />}
        {!!notification.actionUrl && <Pressable onPress={openOffer} style={[styles.offerButton, { backgroundColor: colors.secondary }]}><Feather name="external-link" size={17} color={colors.foreground} /><Text style={[styles.offerText, { color: colors.foreground }]}>Open original offer</Text></Pressable>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16 },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, paddingTop: 42, paddingBottom: 40 },
  senderCard: { borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  senderCopy: { flex: 1 },
  sender: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  message: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 31, lineHeight: 37, letterSpacing: -0.7, marginTop: 32 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 17, lineHeight: 27, marginTop: 15 },
  savedCard: { borderWidth: 1, borderRadius: 17, padding: 16, marginTop: 34 },
  savedTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 11 },
  savedBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 5 },
  button: { marginTop: 18 },
  offerButton: { minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 12 },
  offerText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  status: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 12 },
});