import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
  toggleFlag: (id: string) => void;
  completeTour: () => void;
  saveAlertConfig: (config: AlertConfig) => void;
  updateMembership: (membership: StoreState['membership']) => void;
  clearLocalData: () => void;
}

const STORAGE_KEY = 'dealstasher-local-v1';

const seedNotifications: StoredNotification[] = [
  {
    id: 'deal-01',
    appName: 'Target',
    appColor: '#E7322C',
    title: 'Circle Week starts now',
    body: 'Save up to 40% on hundreds of home, beauty, and tech favorites.',
    capturedAt: '2026-09-10T15:28:00.000Z',
    isFlagged: true,
    actionUrl: 'https://www.target.com/circle',
  },
  {
    id: 'deal-02',
    appName: 'Best Buy',
    appColor: '#F4C400',
    title: 'Your saved deal dropped',
    body: 'The Sony WH-1000XM5 headphones are now $279.99, today only.',
    capturedAt: '2026-09-10T13:52:00.000Z',
    isFlagged: false,
    actionUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=sony+headphones',
  },
  {
    id: 'deal-03',
    appName: 'DoorDash',
    appColor: '#FF3008',
    title: '$0 delivery all weekend',
    body: 'Your favorite local spots are ready. Offer ends Sunday at midnight.',
    capturedAt: '2026-09-10T11:14:00.000Z',
    isFlagged: true,
    actionUrl: 'https://www.doordash.com/',
  },
  {
    id: 'deal-04',
    appName: 'Amazon',
    appColor: '#FF9900',
    title: 'Lightning Deal: 38% off',
    body: 'A deal you viewed is still available for the next 2 hours.',
    capturedAt: '2026-09-09T22:46:00.000Z',
    isFlagged: false,
    actionUrl: 'https://www.amazon.com/gp/goldbox',
  },
  {
    id: 'deal-05',
    appName: 'Nike',
    appColor: '#111111',
    title: 'Members get early access',
    body: 'Shop the new fall collection before it opens to everyone.',
    capturedAt: '2026-09-09T18:08:00.000Z',
    isFlagged: false,
    actionUrl: 'https://www.nike.com/',
  },
  {
    id: 'deal-06',
    appName: 'Hulu',
    appColor: '#1CE783',
    title: 'Your offer is waiting',
    body: 'Get 3 months for $2.99/month. This offer is still active.',
    capturedAt: '2026-09-08T16:22:00.000Z',
    isFlagged: true,
    actionUrl: 'https://www.hulu.com/',
  },
  {
    id: 'deal-07',
    appName: 'Kohl’s',
    appColor: '#24A9E8',
    title: '$10 Kohl’s Cash is ready',
    body: 'Use your reward before it expires this Friday.',
    capturedAt: '2026-09-08T09:36:00.000Z',
    isFlagged: false,
    actionUrl: 'https://www.kohls.com/',
  },
  {
    id: 'deal-08',
    appName: 'Uber Eats',
    appColor: '#06C167',
    title: '20% off your next order',
    body: 'Because dinner should be easy tonight.',
    capturedAt: '2026-09-06T19:41:00.000Z',
    isFlagged: false,
    actionUrl: 'https://www.ubereats.com/',
  },
];

const defaultState: StoreState = {
  notifications: seedNotifications,
  hasSeenTour: false,
  lastAlertTargets: { email: '', phone: '' },
  alertConfigs: [],
  membership: 'trial',
  trialStartedAt: new Date().toISOString(),
};

const DealStasherContext = createContext<DealStasherContextValue | null>(null);

export function DealStasherProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setState({ ...defaultState, ...JSON.parse(saved) });
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [ready, state]);

  const value = useMemo<DealStasherContextValue>(
    () => ({
      ...state,
      ready,
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
    }),
    [ready, state],
  );

  return <DealStasherContext.Provider value={value}>{children}</DealStasherContext.Provider>;
}

export function useDealStasher() {
  const context = useContext(DealStasherContext);
  if (!context) throw new Error('useDealStasher must be used within DealStasherProvider');
  return context;
}