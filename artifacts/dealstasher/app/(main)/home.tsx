import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Screen } from '@/components/Screen';
import { DateFilter, StoredNotification, useDealStasher } from '@/context/DealStasherContext';
import { useColors } from '@/hooks/useColors';

const formatCapturedAt = (value: string) => {
  const date = new Date(value);
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
};

function NotificationRow({ notification, onOpen, onFlag }: { notification: StoredNotification; onOpen: () => void; onFlag: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}>
      <View style={[styles.appDot, { backgroundColor: notification.appColor }]}><Text style={styles.appLetter}>{notification.appName.slice(0, 1)}</Text></View>
      <View style={styles.rowCopy}>
        <View style={styles.rowTop}><Text style={[styles.appName, { color: colors.mutedForeground }]}>{notification.appName}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{formatCapturedAt(notification.capturedAt)}</Text></View>
        <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{notification.title}</Text>
        <Text style={[styles.rowBody, { color: colors.mutedForeground }]} numberOfLines={2}>{notification.body}</Text>
      </View>
      <Pressable testID={`flag-${notification.id}`} hitSlop={12} onPress={onFlag} style={styles.flag}>
        <Feather name={notification.isFlagged ? 'star' : 'star'} size={19} color={notification.isFlagged ? colors.accent : colors.mutedForeground} />
      </Pressable>
    </Pressable>
  );
}

export default function Home() {
  const colors = useColors();
  const router = useRouter();
  const { notifications, toggleFlag } = useDealStasher();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [appName, setAppName] = useState('All apps');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const apps = useMemo(() => ['All apps', ...Array.from(new Set(notifications.map((item) => item.appName)))], [notifications]);
  const filtered = useMemo(() => {
    const now = Date.now();
    const ranges: Record<DateFilter, number> = { all: 0, today: 86400000, week: 604800000, month: 2592000000 };
    return notifications
      .filter((item) => {
        const matchesSearch = `${item.title} ${item.body} ${item.appName}`.toLowerCase().includes(searchText.toLowerCase());
        const matchesApp = appName === 'All apps' || item.appName === appName;
        const matchesFlag = !flaggedOnly || item.isFlagged;
        const matchesDate = dateFilter === 'all' || now - new Date(item.capturedAt).getTime() <= ranges[dateFilter];
        return matchesSearch && matchesApp && matchesFlag && matchesDate;
      })
      .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
      .slice(0, 25);
  }, [appName, dateFilter, flaggedOnly, notifications, searchText]);

  const activeFilterCount = (searchText ? 1 : 0) + (appName !== 'All apps' ? 1 : 0) + (dateFilter !== 'all' ? 1 : 0) + (flaggedOnly ? 1 : 0);

  return (
    <Screen>
      <View style={styles.header}>
        <BrandMark />
        <Pressable testID="profile-button" onPress={() => router.push('/profile')} style={[styles.profileButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="user" size={18} color={colors.foreground} /></Pressable>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.intro}><Text style={[styles.greeting, { color: colors.mutedForeground }]}>YOUR SAVED SIGNALS</Text><Text style={[styles.heading, { color: colors.foreground }]}>Nothing gets lost.</Text><Text style={[styles.subheading, { color: colors.mutedForeground }]}>Showing the latest {Math.min(filtered.length, 25)} notifications in your stash.</Text></View>
            <Pressable onPress={() => setFiltersOpen(!filtersOpen)} style={[styles.filterHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.filterTitle}><Feather name="sliders" size={17} color={colors.primary} /><Text style={[styles.filterText, { color: colors.foreground }]}>Filter notifications</Text>{activeFilterCount > 0 && <View style={[styles.count, { backgroundColor: colors.primary }]}><Text style={[styles.countText, { color: colors.primaryForeground }]}>{activeFilterCount}</Text></View>}</View>
              <Feather name={filtersOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
            </Pressable>
            {filtersOpen && (
              <View style={[styles.filterBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.secondary }]}><Feather name="search" size={16} color={colors.mutedForeground} /><TextInput value={searchText} onChangeText={setSearchText} placeholder="Search words in a notification" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} /></View>
                <Text style={[styles.filterLabel, { color: colors.mutedForeground }]}>TIME RANGE</Text>
                <View style={styles.chips}>{(['all', 'today', 'week', 'month'] as DateFilter[]).map((item) => <Pressable key={item} onPress={() => setDateFilter(item)} style={[styles.chip, { backgroundColor: dateFilter === item ? colors.primary : colors.secondary }]}><Text style={[styles.chipText, { color: dateFilter === item ? colors.primaryForeground : colors.mutedForeground }]}>{item === 'all' ? 'Any time' : item === 'today' ? 'Today' : item === 'week' ? '7 days' : '30 days'}</Text></Pressable>)}</View>
                <Text style={[styles.filterLabel, { color: colors.mutedForeground, marginTop: 16 }]}>SENT BY</Text>
                <View style={styles.chips}>{apps.slice(0, 4).map((item) => <Pressable key={item} onPress={() => setAppName(item)} style={[styles.chip, { backgroundColor: appName === item ? colors.primary : colors.secondary }]}><Text style={[styles.chipText, { color: appName === item ? colors.primaryForeground : colors.mutedForeground }]}>{item}</Text></Pressable>)}</View>
                <Pressable onPress={() => setFlaggedOnly(!flaggedOnly)} style={styles.flagToggle}><Feather name="star" size={16} color={flaggedOnly ? colors.accent : colors.mutedForeground} /><Text style={[styles.flagToggleText, { color: colors.foreground }]}>Only show flagged</Text><View style={[styles.toggle, { backgroundColor: flaggedOnly ? colors.accent : colors.secondary }]}><View style={[styles.toggleKnob, { backgroundColor: flaggedOnly ? colors.accentForeground : colors.mutedForeground, transform: [{ translateX: flaggedOnly ? 12 : 0 }] }]} /></View></Pressable>
                <Pressable onPress={() => router.push({ pathname: '/alert', params: { searchText, appName, flaggedOnly: String(flaggedOnly), dateFilter } })} style={styles.alertLink}><Feather name="bell" size={16} color={colors.primary} /><Text style={[styles.alertLinkText, { color: colors.primary }]}>Alert me of matches</Text><Feather name="arrow-up-right" size={15} color={colors.primary} /></Pressable>
              </View>
            )}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>RECENT CAPTURES</Text>
          </View>
        }
        renderItem={({ item }) => <NotificationRow notification={item} onOpen={() => router.push({ pathname: '/notification', params: { id: item.id } })} onFlag={() => toggleFlag(item.id)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<View style={styles.empty}><Feather name="inbox" size={30} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No matches yet</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try a wider date range or a different search.</Text></View>}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 4 },
  profileButton: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 22, paddingBottom: 30 },
  intro: { paddingTop: 27, paddingBottom: 22 },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -1.1, marginTop: 8 },
  subheading: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 7 },
  filterHeader: { minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterTitle: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  count: { minWidth: 21, height: 21, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
  countText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  filterBody: { borderWidth: 1, borderTopWidth: 0, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, padding: 15 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, minHeight: 46 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14 },
  filterLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1, marginTop: 15, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { minHeight: 31, borderRadius: 10, paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  flagToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 17 },
  flagToggleText: { fontFamily: 'Inter_500Medium', fontSize: 13, flex: 1 },
  toggle: { width: 33, height: 21, borderRadius: 11, justifyContent: 'center', paddingHorizontal: 3 },
  toggleKnob: { width: 15, height: 15, borderRadius: 8 },
  alertLink: { borderTopWidth: 1, borderTopColor: '#303845', flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 14 },
  alertLinkText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, flex: 1 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.3, marginTop: 25, marginBottom: 10 },
  row: { borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: 'row', gap: 11, minHeight: 94 },
  appDot: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  appLetter: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
  rowCopy: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appName: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  time: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 6 },
  rowBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, marginTop: 4 },
  flag: { paddingTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 70, paddingHorizontal: 30 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginTop: 14 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 6 },
});