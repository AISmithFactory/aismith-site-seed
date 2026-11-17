# SCAFFOLD — known-good build target

This seed is an **overlay**, not a whole project. The build is agent-direct: Claude Code clones
the runnable substrate (`AISmithFactory/aismith-site-seed`, a fresh **TanStack Start + SSR**
scaffold) and writes these files into the repo over it. Pin the scaffold here so the next build
diffs against a known-good baseline instead of "whatever today's substrate gives."

## API surface the seed targets (TanStack Start / Router v1)
- `createRootRoute`, `createFileRoute`
- route `head()` returning `{ meta: [...], links: [...] }`
- `HeadContent` + `Scripts` in the root document shell (`__root.tsx` owns `<html lang>`)
- file-based routing under `src/routes` with a generated `routeTree.gen.ts`

## Versions — fill from the first successful build, do NOT guess
Record the exact versions from `package.json` after the first green build, commit this
file, and treat it as the baseline the next agent diffs against.
```
scaffold starter/preset: ____   (the exact template the substrate scaffolded from — name it)
node:                    ____
@tanstack/react-start:   ____
@tanstack/react-router:  ____
vite:                    ____
```
Naming the **starter/preset** makes the baseline reproducible; the version pins make it
diffable. Backfill all five from AS's own first green build, then the next site diffs
against a real baseline instead of "whatever today's substrate gives."
If a future scaffold differs, the four route/`__root` touchpoints adapt; the durable value
(tokens + spine.css + components + composition) is framework-agnostic React.

## Who supplies what
- **Scaffold supplies:** `package.json`, app/vite config, router entry, `routeTree.gen.ts`,
  `/public` served at web root, the SSR server entry.
- **This seed supplies:** `src/styles/*`, `src/components/spine/*`, `src/content/*`,
  `src/routes/*` (incl. the `__root` shell), `functions/*`, `public/sitemap.xml` +
  `robots.txt`, the charter.

## Step 0 (before the first build prompt)
Provision no managed backend (never Lovable Cloud or any other auto-provisioned data surface).
This is a `no-db` site (S5.4); nothing to connect. See README + charter.

## Host / deploy
Host = **Netlify (Pro)**; server-side runtime = **Supabase Edge Functions** in
the site's own functions-only Supabase (never Lovable Cloud). Demo↔production = flip
`seo.noindex` + point the domain. Netlify hosts the front end only. See README "Host model" and
`functions/DEPLOY.md`.
