# Hydration Reminder App

> Example artifact — the reference output of `/create-product` (headers in English, content in the user's language; this example uses English throughout).

## Problem

Knowledge workers spending 6–8h/day on screen forget to drink water. Typical intake is 2–3 glasses/day vs the recommended 6–8; there is no visible reminder during focused work.

## Who it's for

Desktop-bound professionals (25–50, office or home office) with the browser always open.

## Success criteria

1. Users increase intake from 2–3 to 6–7 glasses/day (self-reported in-app).
2. ≥ 70% of notifications get a "Drank" response within 10 minutes.

## Scope

### In
- Web push notifications at a user-configurable interval (default 2h, range 30min–6h), with opt-out.
- "Drank" button that increments a daily counter.
- Daily dashboard: glasses today vs goal (default 8).
- Quick onboarding: goal + interval (~1 min). Data in browser local storage, no accounts.

### Out
- Native mobile apps, cross-device sync, social features, monetization, analytics, external integrations.

## Acceptance criteria

```gherkin
Scenario: Notification fires on schedule
  Given a user with a 2h interval configured
  When 2h elapse since the last notification or "Drank" click
  Then a push notification is delivered with a "Drank" action

Scenario: Logging a drink
  Given a delivered notification
  When the user clicks "Drank"
  Then the daily counter increments by 1 and the timestamp is stored locally
```

## Constraints & dependencies

- Responsive web only; latest 2 versions of Chrome/Safari/Firefox; Web Push API + service worker (requires HTTPS).
- Zero infra budget: static hosting + local storage.

## Open questions

| Question | Owner | Status |
|---|---|---|
| Notification scheduling: fixed clock times or rolling interval from last interaction? | tech lead — affects service-worker design | open |
| Persistence: localStorage or IndexedDB for the 30-day history? | implementer — decide in the first card | open |
