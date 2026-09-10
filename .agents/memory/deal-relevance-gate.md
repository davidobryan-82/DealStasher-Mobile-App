---
name: Deal relevance gate
description: Product rule for deciding which captured notifications enter the visible DealStasher vault.
---

Captured or explicitly imported notifications must contain a currency symbol, a percent sign, or a recognized shopping-deal signal in the title or body before they enter the visible deal vault. User-facing search, app, date, and flagged filters run after this gate.

**Why:** DealStasher should avoid filling the vault with unrelated notification noise while still catching deals such as “free shipping,” “flash sale,” or “use code SAVE20” when a price symbol is absent.

**How to apply:** Keep the same OR-based signal list at native Android ingestion and JavaScript merge/import boundaries. Expand the list cautiously because broad words such as “offer” and “rewards” can create false positives.