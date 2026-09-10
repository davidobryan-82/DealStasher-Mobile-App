---
name: Shared inbox link flow
description: How friend-shared notifications become personal inbox messages without recipient selection in the native share sheet.
---

Shared notifications use an unguessable canonical HTTPS link. The native share sheet does not expose the chosen recipient, so the mobile app creates the share first; when the recipient opens the link and is authenticated, the app claims it into that user's inbox.

**Why:** Native sharing can target SMS, email, social apps, and contacts without giving the sending app a reliable recipient identity. Claim-on-open preserves privacy and works across all share targets.

**How to apply:** Keep the public share payload read-only until a signed-in user claims it. The mobile route should show the payload before sign-in, preserve the token through auth, then add it to the user's inbox.