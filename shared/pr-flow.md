# PR flow — branch, commit, labels, pull request

Shared core used by `do-task` (feature PRs) and `chaos-engineering` (test PRs). Scope by Repo role (`${CLAUDE_PLUGIN_ROOT}/shared/workflow-context.md`):

- **Remote + CLI/MCP** → this whole document applies.
- **Git repo, no remote** → stop after the local-commit step; no PR, no labels, card goes `in-progress → done` directly.
- **No git repo at all** → this document does not apply. Edit files only, list every changed file in the handoff, and state that no commit was made.

## Branch

1. `git fetch origin <base>` (base = the branch resolved by `/groundwork` in `docs/agents/tracker.md`; fallback detection, try in order and stop at the first success: `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`, then `git symbolic-ref refs/remotes/origin/HEAD`; if all fail, assume `main`. Never assume `dev`/`staging` — commonly deploy branches).
2. Branch name = the card id, transformed only as needed for git syntax (`TASK-042`, `ENG-598`; `#123` → `issue-123`). Already on an automation branch (`claude/*`, `codex/*`, or your harness's prefix)? Keep it.
3. Never edit on the base branch. Rebase on `origin/<base>` before starting; irresolvable divergence → stop and ask.

## Commit

- Small, descriptive commits following the repo's style (`git log --oneline -20` first).
- Stage by name — never `git add -A` / `git add .`.
- **Secret check before every commit**: staged names against `.env* *.pem *.key credentials.json`; staged diff against `password|secret|token|api[_-]?key|private[_-]?key|bearer`. Any hit → stop and show the user.
- Never `--no-verify`, never force-push, never push to the base branch. Push with `-u origin <branch>`; on network failure retry 4× with exponential backoff.

## Labels — role map

Skills think in **label roles**; `docs/agents/labels.md` maps roles to the repo's actual labels (default: role name = label name). The map is resolved and written back through the same machinery as roles (`workflow-context.md` § Resolution order / Write-back):

```
ready-for-agent: ready-for-agent      # card fully specified, agent may pick it up
in-progress:     in-progress
in-review:       in-review
needs-human:     needs-human          # parked by the automode park protocol — no auto-pickup
category:feature: Feature             # TAG → category label
category:fix:     BUG
chaos:passed:     chaos:passed
chaos:found-bugs: chaos:found-bugs
required:        []                   # labels CI enforces on every PR, if any
```

Rules:

1. Apply the full resolved label set **at creation time** (issue or PR) — one convention, whether or not `required` is non-empty. Validate each label exists (`gh label list` / `get_label`) — never create labels silently.
2. **State labels are mutually exclusive**: transitions swap them (`--add-label <new> --remove-label <old>`) per the lifecycle table in `card-format.md`. Never leave a stale state label behind.
3. If `required` is non-empty (repos with a label-checking workflow), PR creation is a **transaction**: create PR → apply full label set immediately, same round. Label application fails → escalate; don't leave the PR unlabeled.
4. Only when the map can't resolve a needed label: ask the user once (a single late-bound question, not re-batched with role resolution) — then **write the answer back into `docs/agents/labels.md`** so it is never asked again.

## Pull request

- Ready for review, **not draft** (draft suppresses bot reviews); exception: user explicitly asked for draft this session.
- Title: `<card-id> | <summary ≤ 70 chars>` — card-id exactly as the tracker displays it (`#123`, `TASK-042`, `ENG-598`). Only branch names get the git-safe transform; titles never do.
- Body: Context (card link — `Closes #<n>` in GitHub Issues mode so the card auto-closes on merge) · What changed · How to test · Checklist (lint / typecheck / tests / size budget).
- The PR size budget **always resolves** (`workflow-context.md` § Validation). About to exceed it → stop and propose split points **before** opening the PR. Shipping oversized anyway (user's explicit call) → note the size exception in the PR body (a visible callout with the number and the user's rationale) and request review from the `escalation:` target in `docs/agents/reviewer.md` — no target configured → state in the handoff that escalation was skipped for lack of one.
- Never approve, never merge, never dismiss reviews on your own PR. Merge is a human decision.
- Post-PR: transition the card to `in-review` per the lifecycle table in `card-format.md` (label swap in Mode B) and comment the PR link on it (AI-disclosure rule owned by `${CLAUDE_PLUGIN_ROOT}/shared/guardrails.md`).

## Reviewer handoff

After the PR exists, consult the **Reviewer** role (`docs/agents/reviewer.md`):

- **External bot** (CodeRabbit, Copilot…) with `watch: on` → chain into `/watch-pr`.
- **External bot** with `watch: off` → end with the PR URL; the human drives from here.
- **Agent self-review** (default): before opening the PR, review the diff on two axes — (1) standards: project guidelines + code smells; (2) spec: does the diff satisfy the card's acceptance criteria? Fix findings, then open the PR and end.
- **Human-only**: open the PR and end with the URL.
