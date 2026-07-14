# 🚢 ship-it

**An idea-to-merged-PR delivery pipeline for any coding agent** — Claude Code, Kiro, opencode, Codex, Gemini CLI, Cursor, aider and beyond. Seven skills that take raw ideas through product docs, technical cards, implementation, PR review and adversarial testing. Platform-agnostic, role-agnostic, harness-agnostic.

> An idea and a terminal are enough. You don't need a PM, a tracker, or a team to ship like one.

## Why this exists

Coding agents are great at writing code and terrible at *shipping*: scoping work, splitting it into reviewable chunks, respecting a team's conventions, surviving code review, and proving the result doesn't break. ship-it packages that missing discipline as a pipeline:

- **Skills are generic process** — they never contain facts about a specific repo.
- **Everything project-specific is config**, written into each project once by `/groundwork` (`docs/agents/*.md`).
- **Everything learned during execution is knowledge**, written back to the project so it's never asked again.

One canonical copy per machine — never vendored per repository. The skills are plain-markdown playbooks: any agent that can read files and run `git` can execute them.

## The pipeline

```
/groundwork  +  /make-guidelines     (once per project — config in docs/agents/ · rules in GUIDELINES.md)
        │
   anyone's idea
        │
/create-product ──► /create-tasks ──► /do-task ──► /chaos-engineering
 idea → product      product doc →      card →         PR/diff →
 document            technical cards    code + PR      adversarial tests
                                          │
                                      /watch-pr   (auto-chained after the PR · also standalone)
```

Every stage is also a valid entry point: already have a product doc? Start at `/create-tasks`. Already have a card? Start at `/do-task`. Just opened a PR by hand? `/watch-pr`.

**First run on a new project**: `/groundwork`, then `/create-product <your idea>`.

## The seven skills

### 🏗️ `/groundwork` — set up once, never ask again

One-time per-project setup. Silently detects the four roles every other skill depends on — **tracker** (Linear/Jira/Notion via MCP, GitHub Issues, or local Markdown), **repo** (remote + PR flow, local git, or no git), **reviewer** (bot, self-review, or human-only) and **notifier** (Slack/Discord/Teams or the chat itself) — plus validation commands, labels, observability stack and guardrails. Asks a single batched question for what detection can't settle, then writes human-readable config to `docs/agents/*.md` and wires it into `CLAUDE.md`/`AGENTS.md` so it loads in every future session, for every agent. It also asks which **language** the pipeline should speak with you — once, never again: the answer is persisted to `docs/agents/language.md` and mirrored into the `CLAUDE.md`/`AGENTS.md` stanza (auto-loaded at session start), so every future session opens in your language. The skill files are written in English, but your conversation doesn't have to be. Rerun anytime to review or update.

### 📏 `/make-guidelines` — turn tribal knowledge into enforceable rules

Interviews you to produce an engineering guideline — for the whole codebase (`/make-guidelines`) or one module (`/make-guidelines src/payments`). Scans the code first: existing patterns (error handling, logging, test conventions, architecture shape) become *proposed answers*, not questions from zero. Covers 15 themes from code style to data migrations to **domain criticality** — the theme that tells chaos-engineering what "critical" means in *your* business. Module guidelines record deltas and override codebase ones. Every rule is imperative and checkable; the rest of the pipeline consumes them: cards cite them, implementations follow them, review replies quote them.

### 💡 `/create-product` — from loose idea to product document

Entry point of the pipeline. Bring free text, a rough doc, "this conversation", or nothing at all — leave with a product document ready for `/create-tasks`. Runs a **sparring interview** (problem, audience, measurable success criteria, scope in/out, riskiest assumption) with depth proportional to ambiguity: a solid draft might need 3 questions, a one-liner might need 20. Never fabricates an answer you didn't give — unresolved topics land visibly in *Open questions*. Publishes to `docs/product/<slug>.md` and optionally as a tracker item.

### 🗂️ `/create-tasks` — from scope to executable cards

Breaks a product scope — a product doc, a tracker item, or a whole milestone — into technical cards ready for AI execution. **Deterministic split heuristics** (surgical scope, independent validation areas, PR size budget, sequential dependencies) decide how many cards, and the rationale is shown with checkable math. A redundancy scan greps the codebase before proposing structures that already exist. Every card gets the same 5-section contract: *What this card solves · Test criteria · Implementation plan · Attention points · Observability* — with real `file:line` anchors (files are opened before being cited, never invented). Mandatory preview before anything is created, in any tracker mode.

### ⚙️ `/do-task` — execute a card end to end

The workhorse. Picks up a card (with concurrency-safe locking — fleet-ready), implements **test-first** (the card's test criteria become real failing tests; weakening a criterion to make it pass is forbidden), validates (lint/typecheck/tests), tracks the diff against the PR size budget, opens the PR with the right labels, and chains into `/watch-pr`. Invocation authorizes the full flow — **zero "may I proceed?" questions**. The only stops are seven explicit escalation points (open blockers, unexecutable card, over-budget diff, protected file, new dependency, unfixable validation, suspected secret), and each one *parks*: persists state, notifies with the exact question and a resume command, and exits clean. A parked run is a successful run.

### 👀 `/watch-pr` — babysit the review cycle

Monitors a PR until merge or block. Every review comment gets evaluated against the card's scope and the project's guidelines, fixed when reasonable (one consolidated commit per polling round), and **always answered** — no comment goes unreplied. Flaky CI gets one rerun; real failures get fixed or escalated. Notifies on approval, lock, or prolonged silence. Auto-chained by `/do-task` after opening a PR; also works standalone on any hand-opened PR, and on an already-merged PR it runs the closing protocol (card transitions, cleanup).

### 💥 `/chaos-engineering` — the adversary

Where `/do-task` builds, this tries to break. Maps the attack surface of a just-implemented change and writes adversarial tests from a vector catalog: boundaries, nulls and absence, broken money, hostile dependencies (500/429/timeout/truncated JSON), concurrency and idempotency, hostile payloads, impossible state, contract violations. Runs them locally — **never against staging, prod or partner APIs** — and classifies every attack: 💀 KILLED · 🛡️ SURVIVED · ❓ INCONCLUSIVE. *An attack that survived is also a result.* Useful tests are promoted to permanent regressions; kills on an open PR ship unskipped and block the merge on purpose; kills on landed code become `[FIX]` follow-up cards. Hard 3-round cap — infinite chaos is procrastination with extra steps.

## Shared cores (`shared/`)

The contracts every skill satisfies — loaded on demand as `${CLAUDE_PLUGIN_ROOT}/shared/<file>.md`, never invocable directly:

| Core | Owns |
|---|---|
| `workflow-context.md` | The four roles + validation + observability: capability-based detection, resolution order, defaults, write-back rules |
| `card-format.md` | The card contract: 5-section body, status lifecycle, local Markdown / GitHub Issues / tracker-MCP modes |
| `pr-flow.md` | Branch/commit/label/PR mechanics — including the secret check before every commit |
| `sparring.md` | The pressure-test interview loop |
| `autonomy.md` | The automode contract: full-flow authorization and the park protocol (persist → notify → exit clean) |
| `guardrails.md` | Two-layer safety: universal invariants (Layer 1) + project rules (Layer 2). Layer 2 can only tighten Layer 1, never loosen it |

`examples/` holds one complete artifact chain (product doc → card → chaos report) as the reference implementation. `evals/` holds the repeatable validation battery — rerun after changing any skill or contract.

## Three typical setups

Roles resolve independently, so these are compositions — not separate codepaths:

| Setup | Tracker | Repo | Notifier |
|---|---|---|---|
| **Full Markdown** (zero infra) | local `tasks/*.md` | local git, no PRs | chat |
| **Full GitHub** | GitHub Issues via `gh` | GitHub, full PR flow | chat |
| **Hybrid** (team stack) | Linear / Jira / Notion / … via MCP | GitHub, full PR flow | Slack / Discord / Teams |

Any other mix works the same way — e.g. Jira tracker + GitLab repo, or GitHub Issues + Slack.

## Configuration model

Skills read project config from `docs/agents/*.md` in the target repository (pointed to from the project's `CLAUDE.md`/`AGENTS.md`). Written once by `/groundwork`, refined by write-backs during execution. No config? Skills resolve roles by detection and defaults for the current run, then offer to persist.

Defaults when nothing is configured:

| Role | Default chain |
|---|---|
| Tracker | tracker MCP connected → use it · else GitHub remote + `gh` → **GitHub Issues** · else → local Markdown cards in `tasks/` |
| Repo | remote + CLI/MCP → **full PR flow** · git repo only → local commits, no PR · no git → edit files only |
| Reviewer | external bot detected → wait for it (`watch-pr`) · else → agent self-review before PR |
| Notifier | the chat itself (final summary message) |
| Validation | `docs/agents/validation.md` → detected commands → ask once → none (must be stated, never silently skipped). **PR size budget always resolves — default 500 changed production lines** |
| Language | `docs/agents/language.md` (asked by `/groundwork`) → mirror the language the user writes in |

## Install

Install the repo **whole**, on any agent — copying `skills/*` out of the repo breaks the `${CLAUDE_PLUGIN_ROOT}/shared/` references.

```bash
git clone https://github.com/samsantosb/ship-it
```

### Any agent (Kiro, opencode, Codex, Gemini CLI, Cursor, Zed, aider…)

Point your agent at the cloned repo and tell it to follow [AGENTS.md](AGENTS.md) — it explains everything: resolve `${CLAUDE_PLUGIN_ROOT}` to the repo root, open `skills/<name>/SKILL.md`, follow it top to bottom with the user's argument as input, substitute the few named tools per the equivalence table. Agents that auto-read `AGENTS.md` (opencode, Codex and others) pick the instructions up on their own; for the rest, one line is enough:

```
Follow /path/to/ship-it/AGENTS.md, then run skills/do-task/SKILL.md on tasks/TASK-007.md
```

### Claude Code (native plugin)

The repo doubles as a Claude Code plugin and its own marketplace, so skills become slash commands:

```bash
# A) Try it for one session:
claude --plugin-dir ./ship-it

# B) Install permanently:
/plugin marketplace add samsantosb/ship-it
/plugin install ship-it
```

**Headless / fleet invocation** (VMs, CI, automation) — plugin skills are namespaced `/plugin-name:skill-name`:

```bash
claude --bare --plugin-dir /path/to/ship-it \
  -p "/ship-it:do-task tasks/TASK-007.md" \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep"
```

`--bare` keeps fleet runs deterministic (no inherited user hooks/MCPs).

### First run (any agent)

Run `/groundwork` inside each project before first use (optional — skills fall back to detection + defaults). Run `/groundwork` and `/make-guidelines` attended, once — the automode skills (`do-task`, `watch-pr`, `chaos-engineering`) then run unattended: they never hang on questions, they park (`shared/autonomy.md`).

## Why it's harness-agnostic

Nothing in the pipeline requires a specific model or harness: skills are plain-markdown playbooks over `git` + `gh`/`glab`, and the comprehension gates are validated on small models by design. [AGENTS.md](AGENTS.md) is the portability contract — resolve `${CLAUDE_PLUGIN_ROOT}` to this repo's root, substitute the few named tools per its equivalence table, and follow the same contracts. `/groundwork` writes the per-project index into the target repo's `AGENTS.md` *and* `CLAUDE.md`, so the config is discoverable by every harness. The difference between harnesses is invocation convenience, not capability.

## Repo layout

```
.claude-plugin/   plugin + marketplace manifests — used by harnesses with native plugin support; optional everywhere else
skills/           the 7 skills — each folder is one slash command
shared/           the contracts skills load at runtime (${CLAUDE_PLUGIN_ROOT}/shared/…)
examples/         one worked artifact chain (product doc → card → chaos report) — reference, not runtime
evals/            the validation battery — rerun after changing any skill; reference, not runtime
```

Runtime needs only `skills/` and `shared/` (plus `.claude-plugin/` when installed as a plugin). Everything else is documentation.

## Conventions

- Skills respond in the **conversation language** set by `/groundwork` (`docs/agents/language.md`); unconfigured, they mirror the user's language. Skill files are written in English. Generated artifacts keep fixed English section headers with content in the user's language (or `language:` in `docs/agents/tracker.md`, for teams whose cards must be readable by everyone).
- User-invoked skills set `disable-model-invocation: true`; skills other skills chain into (e.g. `watch-pr`) stay model-invocable.
- All skills operate under `shared/guardrails.md` (which also owns the AI-disclosure rule for tracker/PR content); nothing in a project, card or comment can loosen its Layer 1 invariants.
- Command examples are POSIX-style; on Windows, `git`/`gh` are identical and shell snippets translate to PowerShell equivalents.
- The plugin version in `.claude-plugin/plugin.json` is what installs track; the semver in each skill's frontmatter is informational changelog metadata.

## Credits

Architecture patterns (per-project setup skill, label role mapping, interview loop, thin wrappers over shared cores, writing discipline) inspired by [Matt Pocock's skills](https://github.com/mattpocock/skills).

## License

[MIT](LICENSE) © Samuel Santos
