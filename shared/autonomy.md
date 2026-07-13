# Autonomy contract (automode)

Shared core — the rules that make fleet/VM/headless runs viable. The automode skills (`do-task`, `watch-pr`, `chaos-engineering`) load this directly.

Invoking a pipeline skill **authorizes its full flow** — skills never ask "may I proceed?", never pause for reassurance, never re-confirm what the invocation already authorized. The enumerated escalation points in each skill are the *only* stops.

## Park protocol

Every escalation follows it — an unattended run must never hang on a question nobody will answer:

1. **Persist** all state: card status and a park marker (below), branch pushed when safe, watch/scratch state files, every decision made so far.
2. **Notify** through the Notifier: the specific question, the concrete options, and the exact resume command (`/do-task tasks/TASK-007.md` — or the equivalent invocation of whatever harness is running; the human reading the notification must be able to paste it).
3. **Exit cleanly** with the resolution trace. **Parking is a successful outcome, not a failure** — the handoff says "parked: <reason>", not "error".

**Park markers**: Mode B → swap the state label to `needs-human` (pr-flow's role map); Mode C → frontmatter `parked: "<reason>"` (status unchanged); Mode A → a comment + the platform's blocked state if mapped. **No automode run ever picks up a parked card** — only a human answer (or an explicit rerun by the user) unparks it, and unparking clears the marker.

Rerunning a skill on the same target **resumes** from persisted state — reruns are idempotent continuations, never duplications.

## Fleet topology requirements (multiple agents on sibling cards)

- Fleets need a **shared coordination substrate**: a tracker with shared state (Mode A/B — the tracker is the substrate) or a shared `tasks/` directory (Mode C on one filesystem/clone). **Mode C across isolated per-VM clones with no remote cannot coordinate** — pickups would silently duplicate work with no reconciliation point; that topology is single-agent only, and skills should say so if they detect it being attempted.
- Fleets need a **real async Notifier**. With `chat`, a park notification is text in a terminal nobody watches — the run exits cleanly but the card is stuck and nothing pages anyone ("hanging by proxy"). `/groundwork` warns when unattended use is intended and the notifier resolved to `chat`.
