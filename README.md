# CredX — AI Spend Audit Tool

A Neo-Brutalist web application designed to help startups audit their AI software spend, identify savings, and capture leads for Credex.

## Big Picture
AI costs are spiraling. Startups are paying for Cursor, Claude, ChatGPT, and Copilot simultaneously, often with overlapping use cases and oversized plans. CredX provides a 2-minute audit that finds thousands in annual savings.

## Key Features
1. **Spend Input Form**: 3-step wizard with persistence (survives page reload).
2. **Audit Engine**: Logic that evaluates plan right-sizing and tool redundancy.
3. **Audit Results**: Detailed breakdown with a "Hero Metric" for total savings.
4. **AI Summary**: Personalized saving strategy generated via Claude 3 Haiku.
5. **Lead Capture**: Integrated email capture with honeypot and Resend integration.
6. **Shareable URL**: Public results page with dynamic OG images for social sharing.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI/UX**: GSAP, Framer Motion, Lenis (Smooth Scroll), Lucide React
- **Backend**: Supabase (Database), Resend (Transactional Email)
- **AI**: Anthropic Claude API (Claude 3 Haiku)
- **Deployment**: Vercel

## Quick Start
1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the keys.
4. Run development server: `npm run dev`
5. Run tests: `npm run test`

## 5 Design Decisions
1. **Neo-Brutalist Aesthetic**: Chose high-contrast, "chunky" UI to stand out in the crowded B2B SaaS market and convey a "direct/honest" brand voice.
2. **Pure Logic Engine**: Built the audit logic as a side-effect-free function to ensure 100% testability and reliability.
3. **LocalStorage Persistence**: Implemented a `useLocalStorage` hook so founders don't lose their progress if they close the tab while looking up their invoices.
4. **Haiku for Summaries**: Used Claude 3 Haiku for the AI summary to ensure sub-1s latency on the results page.
5. **Public Share IDs**: Used 12-character `nanoid` for audit IDs to allow for public sharing without predictable URLs.

## Live URL
[https://credex-audit.vercel.app](https://credex-audit.vercel.app)
