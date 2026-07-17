# aismith-site-seed — the canonical public-site scaffold

> **This repo is the agent-direct build substrate** (`as-site-build-agent.md` §5). A site build
> clones it, then re-skins `tokens.css` + rewrites `src/content/*` + updates `vite.config.ts`
> `pages` for the client's route set. The frozen spine (`src/components/spine/*`, `src/styles/spine.css`)
> is reproduced **verbatim from `as-site-seed-spine.md`** and is never edited per site.
>
> **Tracks:** site-contract **1.6.7** · spine-standard **v0.11.1** (em-dash-clean). Reconstructed from
> **2026-07-14:** additive Band `ambient` prop (per-skin quiet motion behind CTA bands: embers / node network / dotted grid, gated by `[data-skin]`, reduced-motion safe). Spine files touched: `primitives.tsx`, `spine.css`. From the Claude Design CtaBand handoff; first consumer aismith-site.
> the markdown-of-record (`as-site-seed-spine.md` + `as-site-seed-instance.md`) on the proven TanStack
> Start + Netlify toolchain. **Green:** `vite build` + `node agents/site/verify.mjs . --seed . --charter aismith-site-charter.md` exit 0.
>
> The instance shipped here is the **AI Smith reference site** — the worked example to overwrite.

---

# Public Site — TEMPLATE (AI Smith instance)

The fleet-manufacturable public-site seed. Conforms to `as-site-spine-standard.md`.
This copy is skinned and composed for **AI Smith** — the spine's first instance.

## The contract in one breath
**Spine never changes. Skin is one file. Content is config.** A new site =
clone this → re-skin `tokens.css` → fill `content/site.config` + `content/*` → compose
pages from spine components → pick optional modules. **No spine file is edited.**

## Before you start: scaffold + Step 0 (read first)
This seed is an **overlay, not a whole project.** It ships source files only (no
`package.json`, `app.config`, router entry, `routeTree.gen.ts`, or HTML shell). The build
agent (Lovable) scaffolds a fresh **TanStack Start + SSR** project, then drops these files
in over it.
- **Pin the version** Lovable scaffolds (check `package.json`). This seed was authored
  against the **TanStack Start / Router v1** API surface: `createRootRoute`,
  `createFileRoute`, `head()`, `HeadContent`, `Scripts`. If the scaffold differs, adapt
  the four route/`__root` touchpoints; the durable value (tokens + spine.css + components
  + composition) is framework-agnostic React.
- **Step 0 — backend posture (S5.4), before the first build prompt.** Lovable
  auto-provisions its own backend (Lovable Cloud) on a new project. This site is
  **`no-db`**: **decline it.** A provisioned backend behind a no-db site is a data surface
  the charter forbids and the audit fails. (This is the inverse of the hub lesson, where
  you *connect* Supabase first.) Only an anon-view read-pipe site connects anything, and
  then only the hub's existing project, read-only.
- `__root.tsx` owns the document shell here: it hard-sets `<html lang="en">` and renders
  `HeadContent` + `Scripts`. Do not let the scaffold supply a second shell.
- **Attach every markup file via paperclip; never paste it inline.** Lovable strips
  angle-brackets from pasted text, so all `.tsx` files (and `site.config.tsx` with its
  inline SVG, and `__root.tsx`) are attached by path. Only the tiny no-JSX route files are
  safe to paste. See `SCAFFOLD.md` for the pinned build target and `functions/DEPLOY.md`
  for the Supabase Edge Function shape and (manual) deploy.

## Layout
