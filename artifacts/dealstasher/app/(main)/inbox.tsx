import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useListInbox, useMarkInboxRead } from '@workspace/api-client-react';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function Inbox() {
  const colors = useColors();
  const router = useRouter();
  const inboxQuery = useListInbox();
  const markRead = useMarkInboxRead();
  const items = inboxQuery.data?.items ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR INBOX</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Shared with you</Text>
        </View>
        <View style={[styles.count, { backgroundColor: colors.card }]}>
          <Text style={[styles.countText, { color: colors.foreground }]}>{items.filter((item) => !item.readAt).length}</Text>
        </View>
      </View>

      {inboxQuery.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={[styles.status, { color: colors.mutedForeground }]}>Loading your inbox…</Text></View>
      ) : inboxQuery.isError ? (
        <View style={styles.center}><Feather name="wifi-off" size={28} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Inbox unavailable</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Check your connection and try again.</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (!item.readAt) markRead.mutate({ id: item.id });
                router.push({ pathname: '/inbox/[token]', params: { token: item.token } });
              }}
              style={({ pressed }) => [styles.item, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{item.senderName.slice(0, 1).toUpperCase()}</Text></View>
              <View style={styles.itemCopy}>
                <View style={styles.itemTop}><Text style={[styles.sender, { color: colors.foreground }]}>{item.senderName}</Text><Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(item.createdAt)}</Text></View>
                <Text style={[styles.message, { color: colors.primary }]} numberOfLines={1}>{item.message || 'Shared a notification with you'}</Text>
                <Text style={[styles.notificationTitle, { color: colors.foreground }]} numberOfLines={1}>{item.notificationTitle}</Text>
                <Text style={[styles.notificationBody, { color: colors.mutedForeground }]} numberOfLines={2}>{item.notificationBody}</Text>
              </View>
              {!item.readAt && <View style={[styles.unread, { backgroundColor: colors.primary }]} />}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<View style={styles.center}><Feather name="inbox" size={30} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing shared yet</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>When a friend sends you a DealStasher notification, it will show up here.</Text></View>}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 22, gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, marginTop: 5 },
  count: { minWidth: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  list: { paddingHorizontal: 22, paddingBottom: 32 },
  item: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, minHeight: 116 },
  avatar: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  itemCopy: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sender: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  message: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 7 },
  notificationTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 6 },
  notificationBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, marginTop: 3 },
  unread: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  emptyList: { flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  status: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 12 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginTop: 14, textAlign: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center' },
});