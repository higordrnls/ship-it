---
name: hd-ship-client
description: Prepare an approved website for release and client handoff without unauthorized production changes.
disable-model-invocation: true
---

# Ship client

Read HD standards, approved scope, audit and proposal. Verify client approval, correct contact details, permissions, outstanding defects, authorized production URL, hosting ownership and privacy requirements. Record rollback and backup approach. Require human review/merge per upstream rules. If authorization or release gates are absent, stop at a release checklist.

On explicitly authorized deployment, use the target's existing release method; never purchase, expose secrets, or modify protected deployment configuration without appropriate approval. Validate the deployed URL, HTTPS, main CTA, assets and indexing configuration if tools permit. Distinguish observed checks from unperformed ones.

Deliver docs/hd/handoff.md with URLs, asset sources, maintenance instructions, known limitations, ownership, agreed support and rollback steps. Never publish credentials; use a secure transfer method outside the repository.
