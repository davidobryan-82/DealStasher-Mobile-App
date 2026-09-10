---
name: Native notification capture
description: Platform constraints and product decision for DealStasher notification ingestion.
---

Android automatic capture requires a custom native build with a NotificationListenerService and an explicit user-enabled Notification Access permission. iOS cannot passively read notification history from other apps, so its supported path is an explicit Share Sheet/import flow.

**Why:** Mobile operating systems expose different notification APIs; claiming passive iOS capture would be misleading and would risk App Store rejection.

**How to apply:** Keep Android access status, revocation, and sensitive-content disclosure visible in the mobile UI. Keep iOS messaging explicit that only content the user chooses to share is imported, and validate both paths on real store-like builds rather than Expo Go.