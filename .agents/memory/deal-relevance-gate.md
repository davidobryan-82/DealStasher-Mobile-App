---
name: Deal relevance gate
description: Product rule for deciding which captured notifications enter the visible DealStasher vault.
---

Captured or explicitly imported notifications must contain a currency symbol, a percent sign, or a recognized shopping-deal signal in the title or body before they enter the visible deal vault. User-facing search, app, date, and flagged filters run after this gate.

**Why:** DealStasher should avoid filling the vault with unrelated notification noise while still catching deals such as “free shipping,” “flash sale,” or “use code SAVE20” when a price symbol is absent.

**How to apply:** Keep the same OR-based signal list at native Android ingestion and JavaScript merge/import boundaries. Expand the list cautiously because broad words such as “offer” and “rewards” can create false positives.

The shared signal alternatives must stay in a runtime-neutral JavaScript module consumed by both the TypeScript app code and the CommonJS Expo config plugin; the device-free parity test should compare representative outcomes and the generated Java pattern.

**Why:** Expo config plugins execute directly in Node while the mobile app is bundled separately, so a TypeScript-only or ESM-only source can make the native generation path drift or fail to load.

**How to apply:** Add or change an alternative once in the shared module, then run the artifact test suite; do not maintain separate JavaScript and Java regex lists.