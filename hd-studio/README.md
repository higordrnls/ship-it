# HD Studio — v0.1

> Creative intelligence & digital development.

HD Studio is an experimental service-delivery extension of [Ship It](https://github.com/samsantosb/ship-it), by Samuel Santos (MIT). It adds the commercial and design stages surrounding software delivery. It is not a registered company, a hosted service, or a native plugin release.

## Start here

In a coding agent, point to this repository and read the root AGENTS.md, shared/guardrails.md, and hd-studio/AGENTS.md. Then invoke an HD playbook by its file path. These playbooks are Markdown instructions, not executable commands. Keep the whole repository available, including upstream skills and shared contracts. Use a separate target repository/workspace for each client; never store customer data in this public fork.

## Modules

- **HD Core**: existing Ship It engineering skills; project standards, validation, review and safe autonomy.
- **HD Web**: design direction, configurable landing-page architecture, preview development and audits.
- **HD Sales**: qualified prospecting, briefings, proposals and handoff.

## Pipeline

prospect → briefing → design-direction → build-preview → audit-website → create-proposal → ship-client

The preview is a proposal artifact, not an assertion that the business commissioned or approved the work. No external outreach, paid service, public publication, transfer, or production deployment is implicit. The operator authorizes each such action.

## Playbooks

| Stage | Playbook | Output in target workspace |
|---|---|---|
| Prospect | [prospect](skills/prospect/SKILL.md) | opportunity.md |
| Brief | [briefing](skills/briefing/SKILL.md) | brief.md |
| Design | [design-direction](skills/design-direction/SKILL.md) | design.md |
| Build | [build-preview](skills/build-preview/SKILL.md) | product spec, task plan, preview |
| Audit | [audit-website](skills/audit-website/SKILL.md) | audit.md |
| Proposal | [create-proposal](skills/create-proposal/SKILL.md) | proposal.md |
| Handoff | [ship-client](skills/ship-client/SKILL.md) | handoff.md |

Use [service standards](STANDARDS.md), the [brief template](templates/brief.md), and the [pilot scenario](examples/pilot.md). For validation, follow [evals](evals.md). No native slash-command registration is added in v0.1.

## Milestones

1. Document the process and validate the playbooks.
2. Run a real pilot in a separate workspace; measure actual time and costs, then capture feedback.
3. Extract reusable UI components only after the pilot validates the need.
4. Consider a structured client intake and deployment automation after repeatable sales.

## Attribution

Original Ship It copyright and MIT license remain in the repository root. HD Studio additions are proposed under the same MIT license.
