# Decisions Log

A running log of decisions made during the Skillet build that weren't pre-decided in `CLAUDE.md` or `docs/build-prompt.md`. The point is to make Diego's "what's mine to revisit later?" question easy to answer.

Entries should be brief. Format:

```
## [Date] — Short title
**Decision:** What was decided
**Why:** Brief rationale
**Reversible?** Yes / No / With effort
```

---

## Template entry — delete this when the first real entry is added

## 2026-05-05 — Example: useReducer over useState for filter state
**Decision:** Filter state in the search feature uses a reducer rather than multiple useState calls.
**Why:** Five interdependent filters (diet, intolerances, time, meal type, calories) where changing one can affect others. Reducer keeps the logic in one place and easier to test.
**Reversible?** Yes — straightforward to refactor back to useState if needed.

---
