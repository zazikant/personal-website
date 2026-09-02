# GraphMailer — personal website

Single-page hero carousel selling GraphMailer, an Office 365-native email marketing app built on Microsoft Graph.

## Files

- `index.html` — entire site (carousel + contact modal), self-contained, no build step

## Deploy

### Vercel

1. Push this repo to GitHub (already done).
2. In Vercel → **New Project** → import `zazikant/personal-website`.
3. Framework Preset: **Other** (no build).
4. Output directory: leave blank (root).
5. Deploy.

Vercel will serve `index.html` as a static site. No build, no env vars, no server.

### Local preview

```bash
npx serve .
# or
python -m http.server 8000
```

## Stack

- Plain HTML + CSS + JS (no framework, no Tailwind, no router).
- GSAP for slide transitions (loaded from CDN).
- Hero images from Unsplash.
- Contact form falls back to `mailto:` for static deploy.

## Customise

- Swap `hello@graphmailer.app` in the contact-form script for your real address.
- Edit the three slides in `index.html` — each `<div class="hero-section">` is one slide.
- Brand colors live in the `<style>` block; primary action button is `#ffffff`.
