# ☠️ Chaos Report — TASK-001 (drink counter)

> Example artifact — the reference shape of a full chaos report. In a real run this file is named `chaos-reports/TASK-001-2026-07-02.md` (`<target>-<date>.md` — card id, or PR number when no card is linked; always gitignored); the stable name here is only for the docs example.

Target: local diff vs `main` · Rounds: 2/3 · Attacks: 7 · 💀 1 KILLED · 🛡️ 5 SURVIVED · ❓ 1 INCONCLUSIVE
(Vocabulary per `card-format.md`: KILLED = attack broke the code, a finding; SURVIVED = code withstood it.)

## 💀 KILLED (findings, by severity)

1. 🟡 medium — **Double-click double-counts** — vector: concurrency/idempotency · file: `src/counter/counter.ts:41`
   Repro: two `click` events within 50ms → two entries with the same second.
   Test: `src/counter/counter.chaos.spec.ts` (promoted, unskipped — blocked the merge until the fix landed in this PR).

## 🛡️ SURVIVED (also information)

- Boundaries: 0 glasses, goal=1, 999 clicks in a day — all handled.
- Hostile state: corrupted storage JSON → wrapper resets with a warning, no crash.
- Clock: 29-Feb and DST transitions roll over correctly.
- Nulls: missing goal falls back to default 8.
- Contract: string `"4"` vs number 4 from storage → normalized at the wrapper.

## ❓ INCONCLUSIVE

- Fake-timer flake on the midnight-rollover test under `--runInBand`; test issue, not code issue. Not counted as a finding.

## Arsenal

2 files, 7 tests · promoted to permanent regression: 2 (the KILLED repro + 1 SURVIVED test covering a gap no existing test covered) · discarded (redundant): 5
