---
name: Clerk device verification
description: Constraints for validating Replit-managed Clerk social sign-in on native devices.
---

Replit-managed Clerk’s Auth pane may be unavailable when the current workspace user lacks personal Pro access, even though the app is configured and the native bundle can compile. Physical iOS/Android OAuth verification still requires a signed native build, real Google accounts, and access to the Development and Production provider settings.

**Why:** Native browser handoff and provider-side enablement cannot be proven from Expo web preview or static bundle export alone.

**How to apply:** Separate repository/build verification from provider/device verification; report the latter as blocked rather than treating a clean web preview as proof.