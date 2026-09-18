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

## File classification -- SEED-SPINE / SEED-INSTANCE / UNRULED

**Re-measured 2026-09-06 at `main` `5e77d77f`; CLOSED the same day at `cef3a063`.** A file is
classified when canon says whether it is **SEED-SPINE** (identical across every site at one
contract version) or **SEED-INSTANCE** (per client). Measured 2026-08-14 at `d719e03b`, **nine of
the seed's own files were neither** (15.3%), and the seed is the upstream floor under
`aismith-site`'s 103 of 170. One of the nine, `src/router.tsx`, was declared SEED-SPINE at
site-contract 1.8.19 and is in the gate's baseline via `EXTRA_SPINE`. The other eight are
classified below. **Nine of nine, and the UNRULED group is empty.**

**Four were classified here on 2026-09-06 because existing canon already decided them.** Each
restates an instruction that is already written down somewhere; none is a new rule.

| File | Class | The statement it follows |
|---|---|---|
| `vite.config.ts` | **SEED-INSTANCE** | `prompts/builds/site-build.md` instructs the builder to *update `vite.config.ts` `pages` to match* the client route set. A file canon tells a builder to edit cannot be identical across sites. |
| `netlify.toml` | **SEED-INSTANCE** | Per-site deploy configuration (site name, redirects, headers). Nothing shared claims it. |
| `.gitignore` | **SEED-INSTANCE** | Per-repo hygiene; a site adds its own ignores and no check reads it. |
| `backlog.md` | **SEED-INSTANCE** | This repo's own open work. A site forking it would inherit the seed's backlog, which is plainly wrong. |

**The remaining four were RULED SEED-INSTANCE by the operator on 2026-09-06.** They had been
left UNRULED deliberately rather than through oversight: each binds the whole fleet the moment
it is called, and PR #19 recorded the cost of both readings beside each file so the ruling would
be one line rather than a re-investigation. It was taken as one decision for all four.

| File | Class | The cost of the reading that was not taken |
|---|---|---|
| `package.json` | **SEED-INSTANCE** (ruled 2026-09-06) | SEED-SPINE would mean every site's dependency set is byte-identical to the seed's, so a site adding one dependency goes red on `[1b]`. A site MAY add a dependency; the seed's own pins remain the authored-against set and are asserted by `SCAFFOLD.md`, not by the gate. |
| `package-lock.json` | **SEED-INSTANCE** (ruled 2026-09-06) | Follows `package.json` and cannot be classified apart from it, so it takes the same class for the same reason. |
| `tsconfig.json` | **SEED-INSTANCE** (ruled 2026-09-06) | SEED-SPINE would freeze compiler settings a site cannot extend. The cost of this reading is real and is stated rather than hidden: a site that LOOSENS these settings breaks the spine silently rather than visibly, and nothing in the gate sees it. |
| `public/_headers` | **SEED-INSTANCE** (ruled 2026-09-06) | A security posture that arguably should be identical everywhere. Ruled per-site; making it identical fleet-wide is a separate act, not a record. |

**The gate's baseline moves by ZERO paths, and that is what "widen accordingly" comes to here.**
`agents/site/verify.mjs` covers **26 files** at this sha (every file under
`src/components/spine/`, `src/styles/spine.css`, and `src/router.tsx` via `EXTRA_SPINE`).
`EXTRA_SPINE` is the SEED-SPINE baseline and holds SEED-SPINE paths only. **All eight files
classified above are SEED-INSTANCE, so none of them is a baseline path** and the baseline stays
at 26. A SEED-INSTANCE ruling widens the baseline by zero by definition: putting a per-client
file in a byte-identity baseline would red every site that exercised the very per-client licence
the ruling grants, and would be **a gate enforcing a rule no document states**, which is exactly
what `EXTRA_SPINE`'s own comment forbids.

**Two documents disagree about where this classification belongs and the disagreement is open.**
The backlog row asks for it *in the seed's own canon*, which is this file. `verify.mjs`'s
`EXTRA_SPINE` comment says a path is added *only after canon declares it*, naming
`as-site-seed-spine.md`'s file manifest (site-contract 1.8.19) as that canon. Those are different
documents. This block is the seed-side half; the manifest is a stamped Factory file and is not
edited from here, and it carries a sentence -- *the four that remain unclassified are named in
the instance doc* -- that this ruling retires.

## Layout

## The gate's own harness, and the two operands it reads

`agents/site/verify.mjs` is the mechanical gate. `agents/site/verify.selftest.mjs` beside it is the
harness that can FAIL it: it generates a fixture site per case, mutates exactly one thing, and
asserts the finding. Run it bare, from the repo root, with no arguments and no network:

```
node agents/site/verify.selftest.mjs      # exit 0 = every case behaved as specified
```

It is bound in `.github/workflows/site-verify.yml` as its own step, so a change to `verify.mjs`
that silences a check fails the gate rather than passing it quietly. Its SCOPE is stated in its own
header and printed at the end of every run: it covers the checks added on 2026-09-18 and the `[8]`
fill-in branches, not the sections that predate them.

### The `lanes` block, which is what `[9]` reads

`[9] S8 PER-LANE RECORD` is **opt-in**: with no `--brief` it reports NOT ARMED and fails nothing.
Pass `--brief <file>` and it reads ONE fenced block out of that file and nothing else in it, the
same declare-then-enforce shape as `[5]`'s ```routes block. `as-site-intake-standard.md` S8 owns the
requirement; this is the grammar, stated here so a brief author has a source that is not the
checker:

````
```lanes
content: consumed=<what went in>; looked-for=<what it went looking for>
facts: consumed=...; looked-for=...
brand: consumed=...; looked-for=...
enrichment: consumed=...; looked-for=...
intent: consumed=none supplied; looked-for=scope and emphasis
```
````

- One line per lane, `<lane>: consumed=<...>; looked-for=<...>`. **Both halves are required**, and
  a lane that came back thin still owes a record saying so.
- The five lane names are S3's: `content`, `facts`, `brand`, `enrichment`, `intent`. A name S3 does
  not declare is read and reported, never scored.
- `#`-prefixed lines inside the block are ignored. Nothing OUTSIDE the block is read as a record.
- **The check cannot prove a lane was run**, and it says so in its own output. A lane that was never
  run and whose line was written anyway passes it. What it proves is that the record EXISTS and
  names every lane, which is the half a document cannot do.

### `--hue-N` grounds beyond `<Section hue>`

`[2]`'s composed-ground discovery reads a LIST of hue carriers, `HUE_CARRIERS` in `verify.mjs`, one
line per markup attribute that puts a `--hue-N` slot under something: `data-hue` (`<Section hue>`,
handled through the `[data-hue]` cascade) and `data-hue-bar` (`<TierCard hue>`, whose
`.tier-card .tier-ico` hardcodes `color: var(--on-dark)` on that ground). **Extend it by adding a
line**, naming the component that renders the attribute and the `spine.css` anchor that grounds it.
A `data-hue*` attribute the spine layer ships that no entry names is reported as UNSCORED rather
than silently skipped, so the list decaying is a finding.
