---
name: Deal relevance gate
description: Product rule for deciding which captured notifications enter the visible DealStasher vault.
---

Captured or explicitly imported notifications must contain a currency symbol or a percent sign in the title or body before they enter the visible deal vault. User-facing search, app, date, and flagged filters run after this gate.

**Why:** DealStasher should avoid filling the vault with unrelated notification noise, while keeping the first-pass rule predictable and explainable.

**How to apply:** Keep the gate at native Android ingestion and JavaScript merge/import boundaries. Treat phrase-based deal signals as a later, separately evaluated expansion so false positives do not silently broaden the vault.