# DEVLOG.md

## Day 1 — 2026-05-01
**Hours worked:** 4
**What I did:** Initial research into AI pricing (Cursor, Claude, GPT). Set up the Next.js scaffold and defined the core data structures.
**What I learned:** AI pricing is much more fragmented than expected; there's a huge gap between individual and team tiers that startups often miss.
**Blockers:** Finding official Pricing URLs for Enterprise tiers is difficult.
**Plan for tomorrow:** Build the core audit engine logic.

## Day 2 — 2026-05-02
**Hours worked:** 5
**What I did:** Implemented the `runAudit` engine and wrote unit tests. Verified logic for oversized plans and redundancy.
**What I learned:** Pure functions make testing edge cases (like $0 spend or 100% redundancy) incredibly simple.
**Blockers:** None.
**Plan for tomorrow:** Design the Neo-Brutalist UI system.

## Day 3 — 2026-05-03
**Hours worked:** 6
**What I did:** Built the `NeoBrutalism.tsx` component library. Implemented the landing page and basic layout.
**What I learned:** Neo-Brutalism requires very specific shadow and border offsets to look "intentional" rather than "broken."
**Blockers:** GSAP and Next.js 15 App Router hydration issues.
**Plan for tomorrow:** Build the multi-step audit wizard.

## Day 4 — 2026-05-04
**Hours worked:** 5
**What I did:** Implemented the 3-step Audit Wizard with localStorage persistence. Integrated the audit engine into the UI.
**What I learned:** Form state management in multi-step wizards is easier with a simple custom hook than a complex state library like Redux.
**Blockers:** Handling "Custom" monthly spend inputs alongside fixed plan pricing.
**Plan for tomorrow:** Build the results page and AI summary integration.

## Day 5 — 2026-05-05
**Hours worked:** 5
**What I did:** Created the results dashboard. Integrated Claude 3 Haiku for the AI summary paragraph. Set up Supabase.
**What I learned:** Haiku is surprisingly good at concise financial advice; much faster than Sonnet for this specific use case.
**Blockers:** Supabase RLS policy for public share URLs.
**Plan for tomorrow:** Implement lead capture and email notifications.

## Day 6 — 2026-05-06
**Hours worked:** 4
**What I did:** Built the lead capture API and Resend integration. Added the public shareable results page and OG image generator.
**What I learned:** Dynamic OG images significantly increase the "perceived value" of a tool like this.
**Blockers:** Resend domain verification for custom sender email.
**Plan for tomorrow:** Final polish, CI/CD setup, and documentation.

## Day 7 — 2026-05-07
**Hours worked:** 6
**What I did:** Finalized all documentation files. Set up GitHub Actions CI. Conducted final testing on the audit logic.
**What I learned:** Shipping a product in 7 days is about prioritizing the "Audit Logic" over "Fancy Features."
**Blockers:** None.
**Plan for tomorrow:** Launch on Product Hunt.

## Day 8 � 2026-05-08
**Hours worked:** 5
**What I did:** Launched on Product Hunt. Monitored initial traffic and fixed two high-priority UI bugs related to mobile overflow.
**What I learned:** Mobile users interact with the audit wizard differently; simplified the range slider for better touch precision.
**Blockers:** None.
**Plan for tomorrow:** Address user feedback and refine the AI summary logic.
