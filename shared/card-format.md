# Card format — the contract between skills

Shared core. A **card** is the artifact `create-tasks` produces, `do-task` consumes, and `chaos-engineering` audits. The body format is identical everywhere; only storage and metadata change per tracker mode. Section headers are fixed English tokens (stable for parsing); the text inside them is written in the user's language — unless `docs/agents/tracker.md` sets `language:` (teams whose cards must be readable by everyone).

## Body: the 5-section format (all modes)

Empirically validated for AI execution. Title + five fixed sections, in order.

**Section 1 — `## What this card solves`** (for the dev who opens it): 2–4 short paragraphs — the problem slice, how the solution works at a high level, why this approach (rejected alternative), what changes for user/dev/product. PM-readable in 30s; jargon only with an inline definition. If this section can't be written without hand-waving, the scope is ill-defined — run a sparring round (`${CLAUDE_PLUGIN_ROOT}/shared/sparring.md`) instead of shipping the card.

**Section 2 — `## Test criteria`** (describe/it — the verifiable contract): one `it` per acceptance criterion of the parent scope + 1–2 edge cases. Arrange/Act/Assert as one-line bullets — the executor implements them. Concrete values (`expect(alert.state).toBe("firing")`), never "works correctly". Syntax matches the card's stack (Jest/Vitest, pytest, Go table tests…). The card is done when these pass.

**Section 3 — `## Implementation plan`** (how the agent should solve it): entry points, files touched, decisions already made, patterns to follow (referencing real code), validation commands, PR size estimate vs budget, out-of-scope list, dependencies.

- **With a connected repo**: cite `file:line` — but citing a path you did not open this session is forbidden. Read before you cite.
- **Without relevant existing code (degraded mode)** — covers both "no repo" and "connected but empty/greenfield repo": no file anchors. Describe modules/contracts conceptually and state the true situation explicitly (e.g. `No codebase connected — executor must map concepts to files` or `Greenfield repo — no existing files to cite`). Never invent paths, and never copy a marker that misstates reality.

**Section 4 — `## Attention points`** (risks the agent must not miss): backward compatibility, rollback plan, security/PII, migration hazards, affected consumers, feature-flag/rollout notes, anti-patterns (❌). At least one entry — `Additive change, no rollback needed` is a valid entry; silence is not. Pattern and anti-pattern **content** comes from the project (`GUIDELINES.md`, `AGENTS.md`/`CLAUDE.md`, `docs/agents/`), not from the skill.

**Section 5 — `## Observability`** (what must be visible in production): what to log (and at which level), what to instrument (metrics / events / traces), dashboards or alerts to create or update — expressed in the **project's observability stack** (resolution: `workflow-context.md` § Observability). Not every card needs it: judge per card — new surface (endpoint, job, integration, alert) → yes; pure refactor/docs → usually no — and when it doesn't, write `No observability requirements — <reason>`. Never silent.

**Title**: `[TAG] <infinitive verb> <short object> (k/N)` — suffix only when the split produced N > 1, always at the end, total ≤ 70 chars (truncate base with `…` before concatenating). TAGs: `[FIX] [FEAT] [OBS] [DX] [REFACTOR] [MIGRATION] [DOC]`.

**Quality bar**: each card must be independently completable and **verifiable on its own** — if a card can only be demoed together with a sibling, reconsider the split.

## Status lifecycle (all modes)

States: `todo → in-progress → in-review → done`. Transition owners:

| Transition | Owner | When |
|---|---|---|
| (created) → `todo` | create-tasks | at creation |
| `todo` → `in-progress` | do-task | at pickup, **before** implementing — and only after verifying every `blocked_by` target is `done`/closed; any open blocker → stop (park in automode — `autonomy.md`) |
| `in-progress` → `in-review` | pr-flow step of do-task | at PR-open. **`in-review` exists only when a PR exists** — with no remote (or no git), `in-progress` transitions directly to `done` **(still gated on validation-or-explicit-none)** |
| `in-review` → `done` | merge (Mode B auto via `Closes #N`) or do-task on confirmation | at merge |
| `in-review` → `in-progress` | do-task / watch-pr | PR closed without merge |

**No card reaches `done` without the validation gate** (`workflow-context.md` § Validation): run the resolved commands, or state in the handoff that none are configured — silent skips are forbidden.

**Chaos on merged cards**: a chaos finding on a card already `done` never reopens it — open a `[FIX]` follow-up card referencing the finding.

**Concurrency** (teams/fleets — multiple agents on sibling cards; topology requirements in autonomy.md): id allocation is best-effort; a collision surfaces as a git merge conflict or INDEX regeneration, reconcile there — **this reconciliation requires a shared substrate** (shared remote or shared `tasks/` directory); without one, fleets cannot run Mode C at all. Pickup locking, strongest available first:

- **Mode B**: the assignee is the lock — read it immediately before setting it; already claimed → stop.
- **Mode C on a shared filesystem**: re-verify-before-transition narrows the race but is not a lock (read-then-write has a TOCTOU gap). The lock is `mkdir tasks/.locks/<id>` — atomic on every filesystem: creation succeeds → you own the pickup (remove the lock dir after the status transition lands); creation fails → another agent owns it, stop. Stale locks (older than an hour with no matching in-progress card) may be reclaimed with a note in the handoff.
- **Parked cards** (label `needs-human` / frontmatter `parked:` — autonomy.md) are never auto-picked; a human answer unparks and clears the marker. In INDEX.md, a parked card shows the suffix `(parked)` after its status — stuck cards must be visible in the derived view, not only in frontmatter.

## Storage modes

### Mode A — Tracker MCP (Linear, Jira, Notion, …)

Native objects. Parent link via the platform's parent/sub-issue relation; inherit `team`/`project`/`milestone`/`labels`/`priority` from the parent (fields absent on the parent are skipped silently — never ask per field); never inherit `assignee`/`cycle`/`due date`. **Blockers**: the platform's native blocking relation when one exists; otherwise the parseable `Blocked by:` body line from Mode B. The concrete tool calls come from whatever MCP is connected — the contract names the operations, the executor maps them to the loaded tools.

- **Status transitions** use the platform's native states. `/groundwork` records the mapping in `docs/agents/tracker.md` (`states:` block — e.g. `in-review: "In Review"`); unmapped transition → ask once, write back.
- **Hybrid setups are the norm here**: tracker Mode A composes freely with a GitHub/GitLab repo (full `pr-flow`) and an external notifier. The PR body links the tracker card by URL — `Closes #N` auto-close is a Mode B feature; in Mode A, `done` is set via the MCP after merge.

### Mode B — GitHub Issues (default with a GitHub remote)

Via `gh` CLI (no MCP required):

- One issue per card: `gh issue create --title "..." --body-file ...`. create-tasks applies the `todo` state label (`ready-for-agent`) **at creation**, plus the category label from the TAG — both resolved through the role map (`docs/agents/labels.md`; rules and commands owned by `pr-flow.md` § Labels).
- State labels mirror the lifecycle table above and are swapped on every transition (see `pr-flow.md` — a stale `in-progress` label on an issue in review is a bug). `in-progress` additionally sets the assignee (`--add-assignee`).
- Beyond the TAG-derived category label, cards may carry free-form domain labels (`frontend`, `api`, …); only the TAG category is validated against the role map.
- **Parent link**: native sub-issues when the installed `gh` supports them — probe once with `gh issue create --help | grep -q -- --parent` (or just try and fall back on error); otherwise first body line `Parent: #<n>` **and** a task-list entry `- [ ] #<n>` appended to the parent (the one allowed parent mutation; parent content is never rewritten). If `create-product` published the product doc as a tracker item, **that item is the cards' parent**; otherwise the parent reference is the doc path.
- **Blockers**: a parseable body line `Blocked by: #<n>[, #<m>]` (or `Blocked by: none`) — always present, always this exact prefix, so do-task can check it programmatically. Create cards in dependency order (blockers first) so the numbers are real.
- `done` = issue closed (auto via `Closes #N` in the PR body).

### Mode C — Local Markdown (final fallback)

```
tasks/
├── INDEX.md                     # derived view — regenerate from frontmatter on any mismatch
├── TASK-001-slug.md
└── done/                        # completed cards move here (same filename, same INDEX)
```

`INDEX.md` — one bullet per card, ordered by id, exactly this shape (` · ` separator):

```markdown
# Tasks

- TASK-001 · [OBS] Add P90 latency alert · done
- TASK-002 · [FEAT] Add drink counter · in-progress
```

Frontmatter (required) — **the frontmatter is the source of truth; INDEX.md is a derived view**:

```yaml
---
id: TASK-001              # next number = max existing + 1, zero-padded
title: "[FEAT] ..."
status: todo              # todo | in-progress | in-review | done
parent: docs/product/<slug>.md#section    # or TASK-000, or none
labels: [feature, api]
priority: 2               # 1 urgent · 2 high · 3 normal · 4 low
blocked_by: []            # card ids, e.g. [TASK-003] — ids stay valid after the done/ move
created: 2026-07-02
# optional: parked: "<reason>"   — automode park marker (autonomy.md); no auto-pickup while present
---
```

- `parent:` anchors to a **real heading** in the source doc (e.g. `#scope`) — never invent anchors that don't exist as headings.
- No platform parent in this mode, so nothing is inherited: `priority: 3` (normal) unless the product doc or the user states urgency; `labels` are free-form domain tags (the TAG category is the only convention).
- `do-task` updates `status` + the INDEX line at each transition; `done` also moves the file to `tasks/done/` (filename unchanged).
- The card path is the "card URL" — `/do-task tasks/TASK-001-slug.md`. Bare `TASK-001` resolves via `INDEX.md` (which also finds cards already in `done/`).
- `tasks/` is committed when git exists (it is the team's tracker). Only chaos reports are gitignored (below).

## Product context input (create-product output / create-tasks input)

Default discovery order for the product document: explicit path argument → `docs/product/*.md` → `PRODUCT.md` (legacy) → tracker product items → none found: offer to run `/create-product` right there (the pipeline self-heals instead of aborting). Write the resolved location back to `docs/agents/tracker.md`.

## Chaos target and report placement

**Vocabulary (fixed)**: 💀 **KILLED** = the attack broke the code → a finding (bad). 🛡️ **SURVIVED** = the code withstood the attack (good). ❓ **INCONCLUSIVE** = test/environment artifact, not counted as either. Frontmatter/label marker: `chaos: passed` iff zero KILLED findings remain unfixed, else `chaos: found-bugs`.

**Target resolution** (chaos-engineering attacks the first that exists): PR diff → local diff vs the base branch → the files named in the card's Implementation plan (working tree, no-git mode). There is always a target; "no PR" never blocks a chaos run.

Full report is always a local file: `chaos-reports/<target>-<date>.md` (`<target>` = the card id, or the PR number when no card is linked), and `chaos-reports/` must be in `.gitignore` (add the entry if missing — say so in the handoff; skip only when there is no git at all — a repo without a remote still gets the entry).

Summary (~10 lines) goes to the card — **Modes A/B: as a comment, never a body edit. Mode C: the card is ours, so append** a `## Chaos Report` section (wherever the file lives, `tasks/` or `tasks/done/`, resolved via INDEX.md) and set frontmatter `chaos: passed | found-bugs`.

| Mode | Summary destination | State marker |
|---|---|---|
| Tracker MCP | comment on the card (respect the platform's consent guardrails) | — |
| GitHub Issues | `gh issue comment` (+ comment on the PR if one exists) | label `chaos:passed` / `chaos:found-bugs` |
| Local Markdown | appended `## Chaos Report` section | frontmatter `chaos:` field |

**Disclosure**: applies to comments *and* appended sections alike — rule owned by `${CLAUDE_PLUGIN_ROOT}/shared/guardrails.md`.
