# AI Smith — Site Charter

Per-site declaration for the public marketing site. Conforms to
`as-site-spine-standard.md` §9. This is the spec the public-site audit checks the repo
against.

**Site:** AI Smith (aismith) · the spine's first instance / testing ground
**URL:** demo = `<slug>.demos.aismith.io` (Netlify) with `seo.noindex=true` (public but
uncrawlable); production = `aismith.io` with `seo.noindex=false`. Same build, config-only switch.

## Pages / routes (S7.1, S8.4a)
Every public route is declared in the fenced `routes` block below, one per line,
slash-prefixed, `/` for the index. **Nothing outside this block is read as a route
declaration** (site-contract 1.8.8): the previous parser scavenged backticked tokens out of
prose, which meant a charter mentioning `fetch` declared a route called fetch. `verify` [5]
reconciles this block against `src/routes/*.tsx` in BOTH directions -- an undeclared repo
route is an orphan, a declared route with no file is an unfinished retirement.

```routes
/
/restaurants
/cultural
/ownership
/plans
/website
/privacy
```

Each route carries its own `head()` with a unique title; `/privacy` renders the core
`PrivacyNotice` (S7.4). A build reskins this reference set to the client's actual inventory
and **rewrites the block above to match** -- a fork that changes its pages and not its
charter now fails S8.4a at the gate.

## Skin (S2)
- Palette: "Ink, Paper, Ember" — values filled in `src/styles/tokens.css`.
  `--action`/`--accent` map to Ember Deep `#9E4E1E` / Ember `#C0632E`; accent-as-text
  uses `--accent-text` (Ember Deep, AA-safe).
- Fonts: `--font-display` = Bricolage Grotesque, `--font-body` = Inter (loaded in
  `__root.tsx`; self-host via `@fontsource` for production).
- Deliberately distinct from Know Thyself (Fraunces) — AS uses Bricolage Grotesque.

## Content model (S8.1)
- **static-in-repo.** Pages composed in `src/content/*` from spine components. No CMS,
  no hub edit-flow.

## SEO & assets (S7)
- Per-route `head()` on every route (title, description, OG); `lang="en"` hard-set in
  `__root`; `public/sitemap.xml` + `public/robots.txt` shipped.
- **No `og:image` asset in the concept build** — OG is text-only. Add a branded 1200×630
  card to `/public` and an `og:image` meta before launch (flagged in `__root` head()).
- `sitemap.xml`/`robots.txt` use `https://aismith.io` as the canonical host. The crawl is
  allowed on purpose so the `noindex` meta governs: `seo.noindex` (`site.config`) is the
  demo↔production switch — true on the shareable demo, false in production.

## Data posture (S5)
- **no-db.** No database, no Supabase client anywhere in the shipped site. No read-pipe.
- Therefore S6.4 (read-pipe doorway) is **N/A** for this site.
- **Step 0 (S5.4):** at project creation, **decline Lovable's auto-provisioned backend**
  (Lovable Cloud). A no-db site provisions no database. Nothing to connect.

## Optional modules enabled (S3.3)
- **None.** Content-light marketing site. (No marquee, lightbox, gallery, audio, video
  facade, score/step grids, timeline, team, map.) Core spine only.

## Integrations (S6 — endpoints public, secrets in env)
- **Live contact path in THIS build: `mailto:contact@aismith.io`.** Every contact CTA here is a
  mailto — the intended concept MVP. (Production default for a real site is the `ContactForm`
  posting to the shared contact endpoint below; mailto is the concept-demo exception, not the
  fleet default.)
- **Declared, not yet mounted.** The spine's `ContactForm` / `NewsletterForm` **ship but are
  mounted on no page** in this build (footer omits the newsletter); until a form replaces mailto
  they are uncalled. (Capability on the shelf, not live integration.)
- **Contact = shared backbone (no per-site function).** The form posts to the multi-tenant
  `contact` endpoint on the shared **`AISmith-functions`** Supabase project — canonical source
  `functions/contact/` in the Factory repo, **not reproduced per site**. Onboarding a site is a
  **config change, never a code change**: add one key to the `CONTACT_TENANTS` secret
  (`origin -> {to, from?, subject?}`). Origin allowlist is the CORS control; the destination is
  resolved server-side (never from the request body); honeypot + per-origin rate-limit drop abuse.
  Secret: `RESEND_API_KEY` (+ `CONTACT_FROM_DEFAULT`). See `functions/DEPLOY.md`.
- **Newsletter = per-site function (Brevo).** No shared newsletter backbone exists, so this stays
  a per-site Supabase Edge Function deployed into the site's own functions-only project when
  mounted: `/functions/v1/newsletter` (Brevo; `BREVO_API_KEY`, `BREVO_LIST_ID` in env), CORS
  locked to the site domain. See `functions/newsletter.ts` + `functions/DEPLOY.md`.
- **Runtime:** Supabase Edge Functions (Deno, `Deno.serve`), public (`--no-verify-jwt`), no DB
  access, no service-role, no stored data, no `supabase-js` in the bundle — the front end only
  `fetch`es the function URL. They never auto-deploy. Not the classic Netlify/Cloudflare shapes.
- Booking → Cal.com link/embed (optional; no key client-side).
- **No service-role key, no secret, no hub-DB write anywhere client-side.**

## Deploy target (S8.2)
- **Host = Netlify (Pro):** static/prerendered front end (SSG all routes, so
  view-source carries per-route meta), custom domain via CNAME/ALIAS to Netlify, automatic SSL.
- **Server-side runtime = Supabase Edge Functions** in the site's own functions-only project.
  Netlify hosts the front end only — no server logic. Per `as-fleet-organisation.md` §7 host model.
- Demo↔production is configuration only: the `seo.noindex` toggle + the domain (+ optional
  function mount). No host move, no rebuild.

## §8 transfer unit (S8.3)
- Own repo + own host + edge-function env. No DB to transfer. Independently portable;
  not entangled with any hub.

## Footer / brand rule
- Public brand is **AI Smith**; the operating legal entity is not foregrounded in
  client-facing chrome. Legal line: "AI Smith · Antwerp, Belgium · Concept site 2026."
