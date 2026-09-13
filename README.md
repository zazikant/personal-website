# Second Brain — personal RAG website

Single-page landing site for **Second Brain**, a personal RAG (Retrieval-Augmented Generation) knowledge assistant backed by the [`rag-document-assistant`](https://github.com/zazikant/rag-document-assistant) API.

The site is a static `index.html` — no build step, no framework, no server. GSAP (loaded from CDN) handles all slide transitions. The query modal talks directly to the live RAG API at `https://rag-document-assistant-2.vercel.app`.

## What's on the page

- **Hero carousel** — 4 auto-rotating slides: intro, ingest, query & synthesize, retrieval modes. Manual nav arrows, dot indicators, slide counter, 6-second auto-advance.
- **Concepts slider** — adapted from `gallery-demo.html` (telegraphic speech slider). Image layer removed; slides are text-only, themed around the 6 steps of the RAG pipeline (Ingest → Chunk → Embed → Retrieve → Synthesize → Cite). Animated progress bars + auto-advance.
- **How it works** — 3-step pipeline: upload/paste → chunk+embed+store → retrieve+reduce+cite.
- **Features grid** — 9 features: query expansion, document aggregation, LLM reducer, two retrieval modes, metadata filters, Add/Replace/Delete lifecycle, source citation, streaming answers, index reset.
- **Tech stack** — Next.js, Pinecone, NVIDIA embeddings, Supabase, LLM reducer, LiteParse, custom chunking, translation pipeline.
- **API reference** — interactive tabbed code snippets for every endpoint (`/api/query`, `/api/upload`, `/api/ingest`, `/api/documents`, `/api/index/reset`) with one-click copy.
- **Query modal** — replaces the old `mailto:` contact form. Type a question, pick Conversational or Precise mode, and the modal POSTs to the live RAG API, then renders the synthesized answer, source citations, and debug stats.

## Files

- `index.html` — entire site (hero carousel, concepts slider, sections, query modal), self-contained, no build step.
- `images/` — legacy screenshots from the previous GraphMailer site; no longer referenced by `index.html`, kept for history.

## Deploy

### Vercel

1. Push this repo to GitHub.
2. In Vercel → **New Project** → import `zazikant/personal-website`.
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
- Query modal calls the live RAG API at `https://rag-document-assistant-2.vercel.app/api/query`.

## Customise

- Edit the four hero slides in `index.html` — each `<div class="hero-section">` is one slide.
- Edit the six concept captions in the `captions` array inside `initConceptSlider()`.
- Add or remove feature cards in the `.features-grid` block.
- Add or remove API tabs in the `.api-tabs` block and matching snippets in the `snippets` object inside `initApiTabs()`.
- Brand colors live in the `<style>` block; primary accent is `#5eead4`.

## Related

- [`rag-document-assistant`](https://github.com/zazikant/rag-document-assistant) — the RAG API backend this site talks to.
