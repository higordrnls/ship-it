# HD Studio service standards

## Product and commercial

The initial offer is a lightweight business landing page: hero, services, portfolio when licensed assets exist, trust signals only when verified, a contact CTA and business details. Prefer a single-page static delivery when it meets scope. No CRM, checkout, authentication, paid analytics, or admin panel by default.

Never invent testimonials, ratings, years of experience, certifications, customer results, pricing, addresses or phone numbers. Public contact details must be verified before use; ambiguous numbers remain pending. Mark speculative previews as unofficial and unapproved. Do not copy competitors' design or use third-party images, logos or fonts without permission or an applicable license. Use placeholders labeled as such if necessary.

## Design and implementation

- Mobile-first; test at 360, 768 and 1440 CSS pixels, plus keyboard navigation.
- Give each business its own identity; reuse section primitives and content schemas rather than a fixed visual template.
- Semantic landmarks, logical headings, visible focus, meaningful alternative text, sufficient contrast (target WCAG 2.2 AA; do not claim conformance from a checklist alone), reduced-motion support.
- Use responsive optimized images with dimensions, lazy-loading below the fold, and minimal scripts.
- Provide descriptive title, description, social metadata; canonical and indexability only for a confirmed approved production URL. Keep speculative previews unindexed where deployment supports it; this is not access control.
- WhatsApp links must use verified destination numbers and URL-encoded text; distinguish multiple destinations only on confirmed labels. Never embed secrets.
- Prefer no form, tracking or cookies initially. If approved, minimize collected data, define retention, obtain appropriate consent and document LGPD considerations.

## Quality gates

Build/lint/typecheck/tests when supported by the target. Inspect actual rendered pages and links on supported devices. Run an accessibility/performance check if available, report measured results and conditions; target Lighthouse mobile performance >= 90 where practical, not a guarantee. Require no known broken primary CTA, console errors on tested flows, horizontal overflow or critical accessibility findings. A missing test tool is a disclosure, not a pass.

## Release

Before public release: client approval and asset rights, approved business facts, domain/hosting owner, scope and costs, approved privacy requirements, deployment authorization, rollback method and handoff. Human approval remains required for merge. Pilot previews may use temporary URLs with an explicit preview label and approved exposure; do not present them as official sites.

## Metrics

Track time from prospect to reviewed preview, hours spent, quoted vs actual cost, response rate and accepted proposals. Record actual values only, in private records. No automatic outreach or tracking by default.
