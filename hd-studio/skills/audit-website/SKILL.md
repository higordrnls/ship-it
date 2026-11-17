---
name: hd-audit-website
description: Audit the actual preview for functionality, visual quality, accessibility, performance and release risks.
disable-model-invocation: true
---

# Audit website

Read HD standards, brief, design and current build evidence. Review the actual target code and, where available, rendered pages. Check required sections, factual claims, asset rights, mobile widths, overflow, keyboard focus, semantic structure, contrasts, links, contact destinations, console errors, metadata and indexing policy. Measure performance with an available tool and record environment and values. Never run adversarial traffic against an external production site; use upstream chaos-engineering locally when justified.

For each check report pass, fail, not run or not applicable, with evidence. Classify critical, high, medium or low findings. A missing capability remains not run. Do not call a preview release-ready with unresolved critical findings or required approvals.

Write docs/hd/audit.md and recommend corrective tasks using upstream create-tasks when needed. Hand off to proposal or back to build.
