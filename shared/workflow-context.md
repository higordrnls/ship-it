# Workflow context — roles, detection, resolution

Shared core. Every skill in this repo resolves its environment through this document before doing platform-specific work. Skills never hardcode a platform; they require **roles**. All skills also operate under `guardrails.md` (same folder): universal Layer 1 invariants plus project Layer 2 rules — loaded together with project config, and Layer 2 only tightens.

## The four roles

| Role | Contract (minimum operations) | Needed by |
|---|---|---|
| **Tracker** | `read_item`, `create_item`, `update_status`, `list_items`, `comment` | create-product, create-tasks, do-task, chaos-engineering |
| **Repo** | local git (`rev-parse`, branch, commit) + optional remote (`create_pr`, `read_pr`, `read_diff`, `labels`) | do-task, watch-pr, chaos-engineering, create-tasks (redundancy scan) |
| **Reviewer** | something that reviews the diff: external bot, agent self-review, or human-only | do-task, watch-pr |
| **Notifier** | `send_message` to a person or channel | do-task, watch-pr, chaos-engineering (optional) |

A skill only resolves the roles it needs for the requested flow. Resolved roles it does not need are left untouched.

## Resolution order

For each required role, resolve in this order and **stop at the first hit**:

```
1. Explicit argument           (URL/flag the user passed this invocation)
2. Project config              (docs/agents/*.md in the target repo)
3. User memory                 (personal facts: Slack handle, preferred channel)
4. Auto-detection              (see "Detection" below)
5. Question                    (ONE batched AskUserQuestion for all unresolved roles)
6. Default                     (see "Defaults" below)
```

Rules:

- A card **URL is an argument that pins the tracker**: a `linear.app` URL means Linear, a `github.com/.../issues/` URL means GitHub Issues, an `atlassian.net` URL means Jira. If the pinned platform's tools are unavailable, ask specifically about that platform — never fall through silently to a different tracker.
- When step 5 fires, batch **all** unresolved roles into as few `AskUserQuestion` calls as the tool allows (currently up to 4 questions per call — normally one call suffices). Offer the detected/default option first, marked "(Recommended)". Never interrogate one role per message. If nothing is unresolved, skip the ask entirely.
- Steps 4–6 resolving a role means the project has no durable answer yet → trigger **write-back** (below).
- **Two question regimes, never mixed**: config resolution (this document) is batched into one call; design exploration (`sparring.md`) is one question per exchange. Resolve config *before* any sparring begins.
- **Resolution trace**: every skill's handoff ends with one line per role it used — `role → value → source (config | memory | detected | asked | default)` — so the user always sees what ran against what. On groundwork reruns, `config` may be annotated `pre-existing`.

## Detection

Detect by **capability signature**, never by MCP server prefix. Connectors on claude.ai mount servers under UUID prefixes (`mcp__<uuid>__get_issue`), so `mcp__linear__*` matching is broken by design. Match on the tool-name **suffix**:

| Signal | Conclusion |
|---|---|
| Tools ending in `get_issue` + `save_issue` + `list_teams` | Linear connected |
| Tools ending in `create_pull_request` + `get_file_contents` | GitHub MCP connected |
| Tools containing `jira` or ending in `getJiraIssue`-style names | Jira connected |
| Tools ending in `slack_send_message` | Slack connected |
| Tools containing `discord` / `send_email`-style names | Discord / email connected |
| `git remote -v` shows `github.com` **and** `gh` installed + authenticated (`gh auth status` succeeds) | GitHub Issues + PRs available via `gh` CLI (no MCP needed) |
| `git remote -v` shows `gitlab.com` **and** `glab` installed + authenticated (`glab auth status` succeeds) | GitLab available via `glab` |
| `git rev-parse --show-toplevel` succeeds | Local git repo present |
| `.coderabbit.yaml` present, or recent PRs reviewed by `coderabbitai` | Reviewer = CodeRabbit |
| Validation commands in `package.json` scripts / `Makefile` / `CLAUDE.md`/`AGENTS.md` | Validation contract for do-task/chaos |

Known platforms per role (document, don't limit — anything satisfying the contract works):

- **Tracker**: Linear, Jira, GitHub Issues, GitLab Issues, Azure Boards, Asana, Trello, ClickUp, Monday, Notion, Shortcut, local Markdown.
- **Repo remote**: GitHub, GitLab, Bitbucket, Azure Repos.
- **Reviewer**: CodeRabbit, GitHub Copilot review, agent self-review, human-only.
- **Notifier**: Slack, Discord, MS Teams, Telegram, email (via MCP), the chat itself.

## Defaults

| Role | Default chain |
|---|---|
| Tracker | tracker MCP connected → use it · else `github.com` remote + `gh` → **GitHub Issues** · else → **local Markdown** (`shared/card-format.md`). Check in order, stop at the first hit. The GitHub Issues default **requires a github.com remote** — a GitLab-only repo without `glab` falls to local Markdown (and the ask should offer authenticating `glab`) |
| Repo | git repo + remote + CLI/MCP → full PR flow · git repo only → local commits, no PR · no git → edit files only |
| Reviewer | external bot detected → wait for it (watch-pr) · else → **agent self-review** (two axes: standards compliance + spec compliance) before PR |
| Notifier | **chat** — a final summary message. Async events (approval, lock, stall) only exist when a real notifier is configured |

Defaults are silent.

## Validation (resolved like a role, owned by do-task and chaos-engineering)

Lint/typecheck/test commands follow the same resolution order: `docs/agents/validation.md` → detection (`package.json` scripts — root and per workspace; `Makefile`; commands declared in guideline files) → ask once (write back) → **none**.

When the result is **none**, skills may not silently skip: every handoff that would have run validation must state "no validation configured". A card must never reach `done` without either running the resolved validation or making that statement (see `card-format.md` § Status lifecycle).

**PR size budget** (part of validation — always resolves, never "none"): the guard against context degradation — a diff small enough to fit one attention window gets fully read by executor, reviewer and chaos. Resolution: `validation.md` → detected from guideline files → asked by `/groundwork` (recommended default) → **default: 500 changed production lines** when running unconfigured (state it in the handoff, offer write-back). Counting rule: added + modified production code only — test files, fixtures, mocks, generated code and lockfiles don't count. The budget drives `create-tasks`' H3 split and `do-task`'s stop-and-propose-split; a PR that exceeds it anyway must say so in its body and trigger the project's escalation review if one is configured.

The budget is the team's call (any number) but **uniform**: conditional exemptions ("seniors may exceed it") aren't consumable — the pipeline reads one number; to change the limit, change the number. A module's guideline may set a **smaller** budget for its subtree (tighten-only, like every Layer 2 rule), never a larger one.

## Observability (resolved like a role, consumed by create-tasks and do-task)

The stack the project uses for logs, metrics and alerts — feeds every card's `## Observability` section. Resolution:

1. `docs/agents/observability.md` — configured, done.
2. **Detection** (dependencies and config files: `newrelic`, `datadog`, `@sentry/*`, `prom-client`, OpenTelemetry SDKs, loggers like `winston`/`pino`; dashboards-as-code in `infra/`; guideline files) → **follow the codebase's existing game** — never propose a competing stack.
3. Nothing detected and a card actually needs observability → **propose installing the stack's idiomatic structured logger** — Node/TS: `pino` (the default recommendation); Python: `structlog`; Go: `slog`/`zerolog`. This is a new dependency, so the guardrails dependency rule applies: ask with name + version.
4. User declines the logger → `logger: console` — structured `console` logging is the floor, never zero logging.

Hybrid state (`platform: none` but a real logger configured): cards specify what to log via the logger and state `No dashboards/alerts — no observability platform configured`; a platform can be added later without rewriting cards.

Whatever the outcome — detected stack, accepted logger, or declined-to-console — **write it back** to `docs/agents/observability.md` (platform, logger, event naming, dashboards/alerts location) so it is never asked again. Whether a given card needs observability at all is the skill's own judgment (new surface → yes; refactor/docs → usually no) — the ask above is about the *stack*, not permission per card.

## Autonomy contract (automode)

Owned by `autonomy.md` (same folder): invoking a skill authorizes its full flow; escalations follow the **park protocol** (persist → notify → exit clean), never hang; park markers per mode; parked cards are never auto-picked; fleets require a shared substrate and a real Notifier. The automode skills load it directly.

## Write-back (this is how the system stops asking)

Whenever a role was resolved by question or default (steps 5–6), at the **end** of a successful run offer once:

> "I resolved X by asking/default. Want me to save it as this project's default so I never ask again? (writes `docs/agents/<role>.md`)"

Fold this offer into the skill's existing final confirmation or handoff — never a second, separate prompt. Persisting is the user's choice — offer once, don't force. Write-back may update values and **add tightening rules** (e.g. a newly discovered protected path); it may never author anything that weakens Layer 1 (`guardrails.md`).

- **Team-scoped facts** (tracker choice, label map, validation commands, reviewer) → `docs/agents/*.md` in the project repo, so the whole team and every future agent session inherits them.
- **Personal facts** (your Slack member ID, preferred DM channel) → user memory, never the repo.
- Anything learned mid-run that contradicts existing config (a label renamed, a command changed) → update the config file in the same run and mention it in the handoff.

## Missing platform the user wants

If the user wants a platform with no tools available:

1. Give the registration instructions for **their environment**: Claude Code CLI → `claude mcp add ...`; claude.ai / desktop → Connectors menu; any other harness → that harness's own MCP/connector mechanism (see the repo's `AGENTS.md`).
2. MCPs registered mid-session only appear after a **session restart**. Persist every decision already made (write-back), then say: "Restart the session and rerun — I'll pick up where we left off."
3. Never scrape or simulate a platform's API as a workaround.

## Config files read by this document

Written by `/groundwork`, all optional, all in the target repo:

```
docs/agents/tracker.md      # tracker + scope · product_docs · base_branch · language (artifact language) · states (Mode A mapping)
docs/agents/labels.md       # role → actual label map (see pr-flow.md)
docs/agents/reviewer.md     # <bot login> | self-review | human-only · watch: on|off · escalation (over-budget review target)
docs/agents/notifier.md     # channel + target
docs/agents/validation.md   # lint / typecheck / test commands per workspace · PR size budget
docs/agents/observability.md # platform · logger · conventions (event naming, dashboards/alerts location)
docs/agents/guardrails.md   # optional — Layer 2: extra protected paths / forbidden ops (see guardrails.md)
```

The project's `CLAUDE.md`/`AGENTS.md` is the **always-loaded index** — thin pointer sections (`## Agent skills` → this config, `## Guidelines` → the guideline files) and nothing heavy inline. Content lives in the pointed-to files; the index just makes it discoverable in every session.

**Each skill resolves fresh.** Nothing carries over between skills except what's written to disk — the config files above, guidelines, and cards. Never assume a prior skill's resolution or answers are still in context.
