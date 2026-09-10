import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIncomingShare } from 'expo-sharing';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import {
  CapturedNotification,
  getCapturedNotifications,
  getNotificationCaptureStatus,
  NotificationCaptureStatus,
  openNotificationCaptureSettings,
} from '@/services/notificationCapture';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

export interface StoredNotification {
  id: string;
  appName: string;
  appColor: string;
  title: string;
  body: string;
  capturedAt: string;
  isFlagged: boolean;
  actionUrl?: string;
}

export interface AlertConfig {
  email: string;
  phone: string;
  searchText: string;
  appName: string;
  flaggedOnly: boolean;
  dateFilter: DateFilter;
  enabled: boolean;
}

interface StoreState {
  notifications: StoredNotification[];
  hasSeenTour: boolean;
  lastAlertTargets: { email: string; phone: string };
  alertConfigs: AlertConfig[];
  membership: 'trial' | 'active' | 'paused' | 'cancelled';
  trialStartedAt: string;
}

interface DealStasherContextValue extends StoreState {
  ready: boolean;
  captureStatus: NotificationCaptureStatus;
  toggleFlag: (id: string) => void;
  completeTour: () => void;
  saveAlertConfig: (config: AlertConfig) => void;
  updateMembership: (membership: StoreState['membership']) => void;
  clearLocalData: () => void;
  refreshCapturedNotifications: () => Promise<void>;
  openCaptureSettings: () => Promise<void>;
  importSharedNotifications: (values: string[]) => void;
}

const STORAGE_KEY = 'dealstasher-local-v1';

const defaultState: StoreState = {
  notifications: [],
  hasSeenTour: false,
  lastAlertTargets: { email: '', phone: '' },
  alertConfigs: [],
  membership: 'trial',
  trialStartedAt: new Date().toISOString(),
};

const DealStasherContext = createContext<DealStasherContextValue | null>(null);

function createImportedNotification(value: string, index: number): CapturedNotification {
  let hash = 0;
  for (let character = 0; character < value.length; character += 1) {
    hash = (hash * 31 + value.charCodeAt(character)) | 0;
  }
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return {
    id: `shared-${Math.abs(hash).toString(36)}-${index}`,
    appName: 'Imported notification',
    appColor: '#FF6B57',
    title: lines[0]?.slice(0, 120) || 'Imported notification',
    body: lines.slice(1).join('\n') || value,
    capturedAt: new Date().toISOString(),
    isFlagged: false,
    actionUrl: /^https?:\/\//i.test(value) ? value : undefined,
  };
}

export function DealStasherProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(defaultState);
  const [ready, setReady] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<NotificationCaptureStatus>('unavailable');

  const mergeNotifications = useCallback((current: StoredNotification[], incoming: CapturedNotification[]) => {
    const existingById = new Map(current.map((item) => [item.id, item]));
    incoming.forEach((item) => {
      const existing = existingById.get(item.id);
      existingById.set(item.id, { ...item, isFlagged: existing?.isFlagged ?? item.isFlagged });
    });
    return Array.from(existingById.values()).sort(
      (left, right) => new Date(right.capturedAt).getTime() - new Date(left.capturedAt).getTime(),
    );
  }, []);

  const refreshCapturedNotifications = useCallback(async () => {
    const status = await getNotificationCaptureStatus();
    setCaptureStatus(status);
    if (status !== 'enabled') return;
    const captured = await getCapturedNotifications();
    if (captured.length) {
      setState((current) => ({ ...current, notifications: mergeNotifications(current.notifications, captured) }));
    }
  }, [mergeNotifications]);

  const importSharedNotifications = useCallback((values: string[]) => {
    const imported = values.map((value, index) => createImportedNotification(value, index));
    if (imported.length) {
      setState((current) => ({ ...current, notifications: mergeNotifications(current.notifications, imported) }));
    }
  }, [mergeNotifications]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const parsed = JSON.parse(saved) as StoreState;
          setState({
            ...defaultState,
            ...parsed,
            notifications: (parsed.notifications ?? []).filter((item) => !item.id.startsWith('deal-')),
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    void refreshCapturedNotifications();
    const interval = setInterval(() => void refreshCapturedNotifications(), 15000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshCapturedNotifications();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshCapturedNotifications]);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [ready, state]);

  const value = useMemo<DealStasherContextValue>(
    () => ({
      ...state,
      ready,
      captureStatus,
      toggleFlag: (id) =>
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((notification) =>
            notification.id === id ? { ...notification, isFlagged: !notification.isFlagged } : notification,
          ),
        })),
      completeTour: () => setState((current) => ({ ...current, hasSeenTour: true })),
      saveAlertConfig: (config) =>
        setState((current) => ({
          ...current,
          lastAlertTargets: { email: config.email, phone: config.phone },
          alertConfigs: [config, ...current.alertConfigs.filter((item) => item.searchText !== config.searchText)],
        })),
      updateMembership: (membership) => setState((current) => ({ ...current, membership })),
      clearLocalData: () => setState({ ...defaultState, hasSeenTour: true }),
      refreshCapturedNotifications,
      openCaptureSettings: openNotificationCaptureSettings,
      importSharedNotifications,
    }),
    [captureStatus, importSharedNotifications, ready, refreshCapturedNotifications, state],
  );

  return (
    <DealStasherContext.Provider value={value}>
      {children}
      {Platform.OS !== 'web' && <IncomingShareBridge />}
    </DealStasherContext.Provider>
  );
}

function IncomingShareBridge() {
  const { sharedPayloads, clearSharedPayloads } = useIncomingShare();
  const { importSharedNotifications } = useDealStasher();
  const importedPayloadKey = useRef('');

  useEffect(() => {
    const payloads = sharedPayloads
      .filter((payload) => payload.shareType === 'text' || payload.shareType === 'url')
      .map((payload) => payload.value.trim())
      .filter(Boolean);
    if (!payloads.length) return;
    const payloadKey = payloads.join('\u0000');
    if (importedPayloadKey.current === payloadKey) return;
    importedPayloadKey.current = payloadKey;
    importSharedNotifications(payloads);
    clearSharedPayloads();
  }, [clearSharedPayloads, importSharedNotifications, sharedPayloads]);

  return null;
}

export function useDealStasher() {
  const context = useContext(DealStasherContext);
  if (!context) throw new Error('useDealStasher must be used within DealStasherProvider');
  return context;
}