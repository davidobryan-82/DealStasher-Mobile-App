import { useCreateInboxShare } from '@workspace/api-client-react';
import { useUser } from '@clerk/expo';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { StoredNotification } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

export function ShareNotificationSheet({
  notification,
  visible,
  onClose,
}: {
  notification: StoredNotification;
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const senderName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'A DealStasher friend';
  const createShare = useCreateInboxShare();

  const submit = () => {
    createShare.mutate(
      {
        data: {
          senderName,
          message: message.trim(),
          notificationTitle: notification.title,
          notificationBody: notification.body,
          actionUrl: notification.actionUrl ?? null,
        },
      },
      {
        onSuccess: async (share) => {
          const shareText = `${senderName} says: ${message.trim()}\n\n${notification.title}: ${notification.body}\n\n${share.url}`;
          onClose();
          await Share.share({ message: shareText, title: notification.title });
          setMessage('');
        },
        onError: () => Alert.alert('Could not share', 'The notification could not be prepared for sharing. Please try again.'),
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>SEND TO A FRIEND</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>Add a personal note</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>They’ll get the notification and a link back to DealStasher.</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.close, { backgroundColor: colors.card }]}>
              <Text style={[styles.closeText, { color: colors.foreground }]}>×</Text>
            </Pressable>
          </View>

          <TextInput
            autoFocus
            value={message}
            onChangeText={setMessage}
            maxLength={50}
            multiline
            placeholder="This made me think of you"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
          />
          <View style={styles.inputFooter}>
            <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>{senderName} says:</Text>
            <Text style={[styles.counter, { color: colors.mutedForeground }]}>{message.length}/50</Text>
          </View>

          <View style={[styles.preview, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.foreground }]} numberOfLines={1}>{notification.title}</Text>
            <Text style={[styles.previewBody, { color: colors.mutedForeground }]} numberOfLines={2}>{notification.body}</Text>
          </View>

          <Pressable
            testID="share-notification"
            onPress={submit}
            disabled={createShare.isPending}
            style={[styles.shareButton, { backgroundColor: colors.primary, opacity: createShare.isPending ? 0.55 : 1 }]}
          >
            <Text style={[styles.shareButtonText, { color: colors.primaryForeground }]}>{createShare.isPending ? 'Preparing…' : 'Open sharing options'}</Text>
          </Pressable>
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>Choose messages, email, social, or another app from your device’s share menu.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.52)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 32 },
  grabber: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#687080', alignSelf: 'center', marginBottom: 21 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18 },
  headerCopy: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, marginTop: 7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 7 },
  close: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: 'Inter_400Regular', fontSize: 27, lineHeight: 30 },
  input: { minHeight: 86, borderWidth: 1, borderRadius: 16, padding: 15, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 21, marginTop: 22, textAlignVertical: 'top' },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  previewLabel: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  counter: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  preview: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 17 },
  previewTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  previewBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, marginTop: 5 },
  shareButton: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 19 },
  shareButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 10 },
});