import { NativeModules, Platform } from 'react-native';

export type CapturedNotification = {
  id: string;
  appName: string;
  appColor: string;
  title: string;
  body: string;
  capturedAt: string;
  isFlagged: boolean;
  actionUrl?: string;
};

type NotificationCaptureModule = {
  getPermissionStatus: () => Promise<'enabled' | 'disabled'>;
  openPermissionSettings: () => Promise<void>;
  getCapturedNotifications: () => Promise<CapturedNotification[]>;
  clearCapturedNotifications: () => Promise<void>;
};

const nativeCapture = NativeModules.DealStasherNotificationCapture as NotificationCaptureModule | undefined;

export type NotificationCaptureStatus = 'enabled' | 'disabled' | 'unavailable';

export async function getNotificationCaptureStatus(): Promise<NotificationCaptureStatus> {
  if (Platform.OS !== 'android' || !nativeCapture) return 'unavailable';
  try {
    return await nativeCapture.getPermissionStatus();
  } catch {
    return 'disabled';
  }
}

export async function openNotificationCaptureSettings() {
  if (Platform.OS === 'android' && nativeCapture) {
    await nativeCapture.openPermissionSettings();
  }
}

export async function getCapturedNotifications(): Promise<CapturedNotification[]> {
  if (Platform.OS !== 'android' || !nativeCapture) return [];
  try {
    return await nativeCapture.getCapturedNotifications();
  } catch {
    return [];
  }
}

export async function clearCapturedNotifications() {
  if (Platform.OS === 'android' && nativeCapture) {
    await nativeCapture.clearCapturedNotifications();
  }
}