# Sparring — pressure-test an idea before building it

Shared core. Used by `create-product` and as the escape hatch when `create-tasks` meets an ambiguous scope. (The interview-loop concept is adapted from [mattpocock/skills](https://github.com/mattpocock/skills).)

Spar with the user's idea: question it relentlessly until you reach shared understanding, walking every branch of the decision tree and resolving dependencies between decisions one by one. The goal is not to win — it is to leave the idea sharper than it arrived.

## Method

- **One question per exchange**, via `AskUserQuestion` with a **single** question per call. Your suggested answer is the first option, marked "(Recommended)"; the user answers most questions with one keystroke. Never batch design questions — batching is for config resolution (`workflow-context.md`), which must be finished *before* sparring starts.
- **Research context facts before asking; never research design decisions.** "Does a similar module already exist?" — read the code. "What problem does this solve? Who is it for?" — always the user's call, never inferred from code.
- **Follow dependencies.** When an answer opens new branches, walk them before moving to the next top-level topic.
- **Punch at the weak spots first**: the riskiest assumption, the undefined user, the success metric nobody stated. Easy questions warm nothing up.
- **The caller defines the minimum topic checklist** (e.g. `create-product` § 2); sparring guarantees the loop mechanics, not the coverage list.
- Respond in the conversation language (`workflow-context.md` § Language; unset → the user's language).

## Completion

Stop when: every design branch has been examined, dependencies between decisions are resolved, and both sides could state the plan's details without contradiction — concretely, when you could sketch the solution and a QA could write a test plan without guessing. Then hand the accumulated decisions to the caller (`create-product` synthesizes them into a document; `create-tasks` resumes its split with the clarified scope).
