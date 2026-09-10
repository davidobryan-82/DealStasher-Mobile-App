const {
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const nativePackage = 'com.dealstasher.notificationcapture';
const nativeFiles = {
  'DealStasherNotificationModule.java': `package ${nativePackage};

import android.content.Context;
import android.content.Intent;
import android.provider.Settings;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONArray;
import org.json.JSONObject;

public class DealStasherNotificationModule extends ReactContextBaseJavaModule {
  private static final String PREFS = "dealstasher-notification-capture";
  private static final String ITEMS = "items";

  public DealStasherNotificationModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "DealStasherNotificationCapture";
  }

  @ReactMethod
  public void getPermissionStatus(Promise promise) {
    try {
      String enabledListeners = Settings.Secure.getString(
        getReactApplicationContext().getContentResolver(),
        "enabled_notification_listeners"
      );
      boolean enabled = enabledListeners != null &&
        enabledListeners.contains(getReactApplicationContext().getPackageName());
      promise.resolve(enabled ? "enabled" : "disabled");
    } catch (Exception error) {
      promise.reject("STATUS_ERROR", "Could not read Notification Access status.", error);
    }
  }

  @ReactMethod
  public void openPermissionSettings(Promise promise) {
    try {
      Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getReactApplicationContext().startActivity(intent);
      promise.resolve(null);
    } catch (Exception error) {
      promise.reject("SETTINGS_ERROR", "Could not open Android Notification Access settings.", error);
    }
  }

  @ReactMethod
  public void getCapturedNotifications(Promise promise) {
    try {
      String raw = getReactApplicationContext()
        .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getString(ITEMS, "[]");
      JSONArray stored = new JSONArray(raw);
      WritableArray result = Arguments.createArray();
      for (int index = 0; index < stored.length(); index++) {
        JSONObject item = stored.optJSONObject(index);
        if (item == null) continue;
        WritableMap map = Arguments.createMap();
        map.putString("id", item.optString("id"));
        map.putString("appName", item.optString("appName", "Unknown app"));
        map.putString("appColor", item.optString("appColor", "#FF6B57"));
        map.putString("title", item.optString("title", "Notification"));
        map.putString("body", item.optString("body", ""));
        map.putString("capturedAt", item.optString("capturedAt"));
        map.putBoolean("isFlagged", item.optBoolean("isFlagged", false));
        if (item.has("actionUrl")) map.putString("actionUrl", item.optString("actionUrl"));
        result.pushMap(map);
      }
      promise.resolve(result);
    } catch (Exception error) {
      promise.reject("READ_ERROR", "Could not read captured notifications.", error);
    }
  }

  @ReactMethod
  public void clearCapturedNotifications(Promise promise) {
    getReactApplicationContext()
      .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .remove(ITEMS)
      .apply();
    promise.resolve(null);
  }
}
`,
  'DealStasherNotificationPackage.java': `package ${nativePackage};

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DealStasherNotificationPackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext context) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new DealStasherNotificationModule(context));
    return modules;
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext context) {
    return Collections.emptyList();
  }
}
`,
  'DealStasherNotificationListenerService.java': `package ${nativePackage};

import android.app.Notification;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.os.Bundle;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class DealStasherNotificationListenerService extends NotificationListenerService {
  private static final String PREFS = "dealstasher-notification-capture";
  private static final String ITEMS = "items";
  private static final int MAX_ITEMS = 500;

  @Override
  public void onNotificationPosted(StatusBarNotification statusBarNotification) {
    String sourcePackage = statusBarNotification.getPackageName();
    if (sourcePackage.equals(getPackageName())) return;

    Notification notification = statusBarNotification.getNotification();
    if (notification == null || notification.extras == null) return;

    Bundle extras = notification.extras;
    String title = firstText(
      extras.getCharSequence(Notification.EXTRA_TITLE),
      extras.getCharSequence(Notification.EXTRA_TITLE_BIG)
    );
    String body = firstText(
      extras.getCharSequence(Notification.EXTRA_BIG_TEXT),
      extras.getCharSequence(Notification.EXTRA_TEXT),
      extras.getCharSequence(Notification.EXTRA_SUB_TEXT),
      extras.getCharSequence(Notification.EXTRA_INFO_TEXT)
    );
    if (title.length() == 0 && body.length() == 0) return;

    String id = sourcePackage + ":" + statusBarNotification.getKey();
    String appName = sourcePackage;
    try {
      appName = getPackageManager()
        .getApplicationLabel(getPackageManager().getApplicationInfo(sourcePackage, 0))
        .toString();
    } catch (Exception ignored) {
    }

    try {
      JSONObject captured = new JSONObject();
      captured.put("id", id);
      captured.put("appName", appName);
      captured.put("appColor", "#FF6B57");
      captured.put("title", title.length() > 0 ? title : "Notification");
      captured.put("body", body);
      captured.put("capturedAt", isoTime(statusBarNotification.getPostTime()));
      captured.put("isFlagged", false);

      JSONArray current = new JSONArray(getSharedPreferences(PREFS, MODE_PRIVATE).getString(ITEMS, "[]"));
      JSONArray next = new JSONArray();
      next.put(captured);
      for (int index = 0; index < current.length() && next.length() < MAX_ITEMS; index++) {
        JSONObject existing = current.optJSONObject(index);
        if (existing != null && !id.equals(existing.optString("id"))) next.put(existing);
      }
      getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(ITEMS, next.toString()).apply();
    } catch (Exception ignored) {
      // A malformed notification must not interrupt the listener service.
    }
  }

  private static String firstText(CharSequence... values) {
    for (CharSequence value : values) {
      if (value != null && value.toString().trim().length() > 0) return value.toString().trim();
    }
    return "";
  }

  private static String isoTime(long millis) {
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
    format.setTimeZone(TimeZone.getTimeZone("UTC"));
    return format.format(new Date(millis));
  }
}
`,
};

module.exports = function withNotificationCapture(config) {
  config = withAndroidManifest(config, (manifestConfig) => {
    const manifest = manifestConfig.modResults.manifest;
    const application = manifest.application?.[0] || {};
    application.service = application.service || [];
    const serviceName = `${nativePackage}.DealStasherNotificationListenerService`;
    if (!application.service.some((service) => service.$?.['android:name'] === serviceName)) {
      application.service.push({
        $: {
          'android:name': serviceName,
          'android:exported': 'true',
          'android:label': 'DealStasher notification capture',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.service.notification.NotificationListenerService' } },
            ],
          },
        ],
      });
    }
    manifest.application = [application];
    return manifestConfig;
  });

  config = withMainApplication(config, (applicationConfig) => {
    let contents = applicationConfig.modResults.contents;
    if (!contents.includes('DealStasherNotificationPackage')) {
      contents = contents.replace(
        /^(package [^\n]+\n)/m,
        `$1\nimport ${nativePackage}.DealStasherNotificationPackage\n`,
      );
      contents = contents.replace(
        /(PackageList\(this\)\.packages\.apply\s*\{)/,
        '$1\n          add(DealStasherNotificationPackage())',
      );
    }
    applicationConfig.modResults.contents = contents;
    return applicationConfig;
  });

  return withDangerousMod(config, ['android', async (dangerousConfig) => {
    const javaDirectory = path.join(
      dangerousConfig.modRequest.platformProjectRoot,
      'app',
      'src',
      'main',
      'java',
      ...nativePackage.split('.'),
    );
    fs.mkdirSync(javaDirectory, { recursive: true });
    for (const [fileName, source] of Object.entries(nativeFiles)) {
      fs.writeFileSync(path.join(javaDirectory, fileName), source);
    }
    return dangerousConfig;
  }]);
};