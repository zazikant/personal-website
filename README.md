# Second Brain — personal RAG website

Single-page landing site for **Second Brain**, a personal RAG (Retrieval-Augmented Generation) knowledge assistant.

The site is a static `index.html` — no build step, no framework, no server. GSAP (loaded from CDN) handles all slide transitions. The contact form is a simple demo form that shows a success state on submit (wire it to your backend or a form service when ready).

## What's on the page

- **Hero carousel** — 4 auto-rotating slides: intro, ingest, query & synthesize, retrieval modes. Manual nav arrows, dot indicators, slide counter, 6-second auto-advance.
- **Concepts slider** — adapted from `gallery-demo.html` (telegraphic speech slider). Image layer removed; slides are text-only, themed around the 6 steps of the RAG pipeline (Ingest → Chunk → Embed → Retrieve → Synthesize → Cite). Animated progress bars + auto-advance.
- **How it works** — 3-step pipeline: upload/paste → chunk+embed+store → retrieve+reduce+cite.
- **Features grid** — 9 features: query expansion, document aggregation, LLM reducer, two retrieval modes, metadata filters, Add/Replace/Delete lifecycle, source citation, streaming answers, index reset.
- **Pricing** — two plans: $50/month (monthly subscription) and $1,000 (one-time purchase). BYOK note: Supabase, Pinecone, and LLM API keys are bring-your-own; recommended model GLM 5.1, charged at provider actuals.
- **Tech stack** — Next.js, Pinecone, NVIDIA embeddings, Supabase, LLM reducer, LiteParse, custom chunking, translation pipeline.
- **API reference** — interactive tabbed code snippets for every endpoint (`/api/query`, `/api/upload`, `/api/ingest`, `/api/documents`, `/api/index/reset`) with one-click copy. All URLs are dummy (`https://api.second-brain.app`) — replace with your real endpoint at deploy time.
- **Contact form** — a sign-up / enquiry form (name, email, company, plan selector, message). Shows a success state on submit. All CTAs across the site open this modal.

## Files

- `index.html` — entire site (hero carousel, concepts slider, sections, pricing, contact modal), self-contained, no build step.
- `images/` — legacy screenshots from the previous site version; no longer referenced by `index.html`, kept for history.

## Deploy

### Vercel

1. Push this repo to GitHub.
2. In Vercel → **New Project** → import the repo.
3. Framework Preset: **Other** (no build).
4. Output directory: leave blank (root).
5. Deploy.

Vercel serves `index.html` as a static site. No build, no env vars, no server.

### Local preview

```bash
npx serve .
# or
python -m http.server 8000
```

## Stack

- Plain HTML + CSS + JS (no framework, no Tailwind, no router).
- GSAP 3.13 for slide transitions (loaded from CDN).
- Inter for UI text, JetBrains Mono for code / monospace.
- Accent color: `#5eead4` (teal-300) — used for eyebrows, CTAs, accents, code highlights.

## Customise

- Edit the four hero slides in `index.html` — each `<div class="hero-section">` is one slide.
- Edit the six concept captions in the `captions` array inside `initConceptSlider()`.
- Add or remove feature cards in the `.features-grid` block.
- Edit pricing in the `#pricing` section — monthly price, one-time price, and feature lists.
- Add or remove API tabs in the `.api-tabs` block and matching snippets in the `snippets` object inside `initApiTabs()`. Replace dummy `https://api.second-brain.app` with your real API URL.
- Wire the contact form in `initContactModal()` to your backend or a form service (Formspree, Resend, etc.).
- Brand colors live in the `<style>` block; primary accent is `#5eead4`.
